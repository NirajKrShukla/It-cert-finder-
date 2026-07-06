from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import json
import logging
import re
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

from certificates_data import CERTIFICATES_SEED

TRENDING_SLUGS = {
    "aws-ai-practitioner",
    "cka-kubernetes",
    "aws-solutions-architect-associate",
    "az-104-azure-administrator",
    "comptia-security-plus",
    "oracle-java-se-21-professional",
    "mongodb-developer-associate",
    "hashicorp-terraform-associate",
    "ai-900-azure-ai-fundamentals",
    "cissp",
}

LEARNING_PATHS = [
    {"id": "java", "name": "Java Developer Ladder", "tagline": "Zero → Master architect on the JVM.", "accent": "amber",
     "slugs": ["oracle-java-se-8-associate", "oracle-java-se-17-professional", "oracle-java-se-21-professional", "oracle-java-enterprise-architect-master"]},
    {"id": "security", "name": "Cybersecurity Track", "tagline": "Practitioner → Analyst → Leadership.", "accent": "magenta",
     "slugs": ["comptia-security-plus", "comptia-cysa-plus", "cissp"]},
    {"id": "aws-cloud", "name": "AWS Cloud Path", "tagline": "Practitioner → Associate → Professional.", "accent": "mint",
     "slugs": ["aws-cloud-practitioner", "aws-solutions-architect-associate", "aws-solutions-architect-professional"]},
    {"id": "azure", "name": "Azure Admin Path", "tagline": "AZ-900 → AZ-104 → AZ-305.", "accent": "blue",
     "slugs": ["az-900-azure-fundamentals", "az-104-azure-administrator", "az-305-azure-architect"]},
    {"id": "ai", "name": "AI / ML Engineer", "tagline": "Fundamentals → Engineer → Specialty.", "accent": "magenta",
     "slugs": ["ai-900-azure-ai-fundamentals", "aws-ai-practitioner", "ai-102-azure-ai-engineer", "aws-ml-engineer-associate", "gcp-professional-ml-engineer"]},
    {"id": "network", "name": "Network Engineer", "tagline": "A+ → Network+ → CCNA → CCNP.", "accent": "blue",
     "slugs": ["comptia-a-plus", "comptia-network-plus", "cisco-ccna", "cisco-ccnp-enterprise"]},
    {"id": "kubernetes", "name": "Cloud-Native / DevOps", "tagline": "Docker → Kubernetes → IaC.", "accent": "mint",
     "slugs": ["docker-certified-associate", "cka-kubernetes", "hashicorp-terraform-associate"]},
    {"id": "database", "name": "Database Engineer", "tagline": "SQL → NoSQL → Cloud DBs.", "accent": "amber",
     "slugs": ["oracle-database-sql-associate", "mongodb-developer-associate", "azure-dp-300-database-admin", "snowflake-snowpro-core"]},
]

# ------------ Setup ------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_MIN = 60 * 24  # 24 hours
REFRESH_DAYS = 30

app = FastAPI(title="CertHub API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("certhub")

# ------------ Helpers ------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_MIN), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_DAYS), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=ACCESS_MIN * 60, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=REFRESH_DAYS * 86400, path="/")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

def clean_doc(doc: dict) -> dict:
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc

# ------------ Models ------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str = "user"

class Certificate(BaseModel):
    id: str
    slug: str
    name: str
    vendor: str
    level: str
    domain: str
    price_usd: float
    currency: str = "USD"
    duration_minutes: int = 0
    num_questions: int = 0
    passing_score: int = 0
    description: str
    prerequisites: str = ""
    validity_years: int = 0
    official_url: str = ""
    docs_url: str = ""
    videos: List[dict] = []
    practice_url: str = ""
    ai_generated: bool = False

# ------------ Auth endpoints ------------
@api.post("/auth/register", response_model=UserOut)
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "name": payload.name.strip(),
        "role": "user",
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    set_auth_cookies(response, create_access_token(user_id, email), create_refresh_token(user_id))
    return UserOut(id=user_id, email=email, name=doc["name"], role="user")

@api.post("/auth/login", response_model=UserOut)
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_auth_cookies(response, create_access_token(user["id"], email), create_refresh_token(user["id"]))
    return UserOut(id=user["id"], email=email, name=user["name"], role=user.get("role", "user"))

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}

@api.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(id=user["id"], email=user["email"], name=user["name"], role=user.get("role", "user"))

# ------------ Certificates ------------
@api.get("/certificates")
async def list_certs(
    q: Optional[str] = None,
    vendor: Optional[str] = None,
    level: Optional[str] = None,
    domain: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "featured",
    limit: int = 200,
):
    query = {}
    if vendor:
        vendors = [v.strip() for v in vendor.split(",") if v.strip()]
        if vendors:
            query["vendor"] = {"$in": vendors}
    if level:
        levels = [l.strip() for l in level.split(",") if l.strip()]
        if levels:
            query["level"] = {"$in": levels}
    if domain:
        domains = [d.strip() for d in domain.split(",") if d.strip()]
        if domains:
            query["domain"] = {"$in": domains}
    if min_price is not None or max_price is not None:
        pr = {}
        if min_price is not None:
            pr["$gte"] = min_price
        if max_price is not None:
            pr["$lte"] = max_price
        query["price_usd"] = pr
    if q:
        regex = re.escape(q.strip())
        query["$or"] = [
            {"name": {"$regex": regex, "$options": "i"}},
            {"vendor": {"$regex": regex, "$options": "i"}},
            {"description": {"$regex": regex, "$options": "i"}},
            {"slug": {"$regex": regex, "$options": "i"}},
        ]
    cursor = db.certificates.find(query, {"_id": 0}).limit(limit)
    items = await cursor.to_list(limit)
    for it in items:
        it["trending"] = it.get("slug") in TRENDING_SLUGS
    if sort == "price_asc":
        items.sort(key=lambda x: x.get("price_usd", 0))
    elif sort == "price_desc":
        items.sort(key=lambda x: x.get("price_usd", 0), reverse=True)
    elif sort == "name":
        items.sort(key=lambda x: x.get("name", "").lower())
    return {"total": len(items), "items": items}

@api.get("/certificates/facets")
async def facets():
    vendors = await db.certificates.distinct("vendor")
    levels = await db.certificates.distinct("level")
    domains = await db.certificates.distinct("domain")
    return {
        "vendors": sorted(vendors),
        "levels": ["beginner", "intermediate", "expert"],
        "domains": sorted(domains),
        "all_levels": sorted(levels),
    }

@api.get("/certificates/{slug}")
async def get_cert(slug: str):
    doc = await db.certificates.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Certificate not found")
    doc["trending"] = slug in TRENDING_SLUGS
    doc["in_paths"] = [
        {"id": p["id"], "name": p["name"], "position": p["slugs"].index(slug) + 1, "total": len(p["slugs"])}
        for p in LEARNING_PATHS if slug in p["slugs"]
    ]
    return doc

@api.get("/paths")
async def list_paths():
    result = []
    for p in LEARNING_PATHS:
        certs = await db.certificates.find({"slug": {"$in": p["slugs"]}}, {"_id": 0, "slug": 1, "name": 1, "vendor": 1, "level": 1, "price_usd": 1}).to_list(50)
        by_slug = {c["slug"]: c for c in certs}
        ordered = [by_slug[s] for s in p["slugs"] if s in by_slug]
        result.append({**p, "certs": ordered, "total_cost": sum(c.get("price_usd", 0) for c in ordered)})
    return {"paths": result}

# ------------ Shared paths ------------
class SharedPathIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    slugs: List[str] = Field(default_factory=list)

@api.post("/shared-paths")
async def create_shared_path(payload: SharedPathIn, user: dict = Depends(get_current_user)):
    if not payload.slugs:
        fav = await db.favorites.find_one({"user_id": user["id"]}, {"_id": 0})
        payload.slugs = (fav or {}).get("slugs", [])
    if not payload.slugs:
        raise HTTPException(status_code=400, detail="No certificates to share. Save some first.")
    share_id = uuid.uuid4().hex[:12]
    doc = {
        "share_id": share_id,
        "user_id": user["id"],
        "author_name": user.get("name", "Anonymous"),
        "name": payload.name.strip(),
        "slugs": payload.slugs,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.shared_paths.insert_one(doc)
    return {"share_id": share_id, "url": f"/path/{share_id}"}

@api.get("/shared-paths/{share_id}")
async def get_shared_path(share_id: str):
    doc = await db.shared_paths.find_one({"share_id": share_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Path not found")
    certs = await db.certificates.find({"slug": {"$in": doc["slugs"]}}, {"_id": 0}).to_list(500)
    by_slug = {c["slug"]: c for c in certs}
    ordered = [by_slug[s] for s in doc["slugs"] if s in by_slug]
    for c in ordered:
        c["trending"] = c["slug"] in TRENDING_SLUGS
    doc["certs"] = ordered
    doc["total_cost"] = sum(c.get("price_usd", 0) for c in ordered)
    return doc

@api.get("/shared-paths/{share_id}/og.png")
async def og_image(share_id: str):
    from PIL import Image, ImageDraw, ImageFont
    from fastapi.responses import Response as FResponse
    import io
    doc = await db.shared_paths.find_one({"share_id": share_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Path not found")
    certs = await db.certificates.find({"slug": {"$in": doc["slugs"]}}, {"_id": 0}).to_list(500)
    total = sum(c.get("price_usd", 0) for c in certs)
    count = len(certs)
    name = (doc.get("name") or "Learning Path")[:60]
    author = doc.get("author_name", "Anonymous")[:40]

    W, H = 1200, 630
    img = Image.new("RGB", (W, H), (10, 14, 20))
    d = ImageDraw.Draw(img)
    # grid overlay
    for x in range(0, W, 48):
        d.line([(x, 0), (x, H)], fill=(30, 36, 46), width=1)
    for y in range(0, H, 48):
        d.line([(0, y), (W, y)], fill=(30, 36, 46), width=1)
    # mint square logo
    d.rectangle([60, 60, 108, 108], fill=(57, 255, 106))
    d.text((72, 68), ">_", fill=(10, 14, 20))

    def font(sz, bold=False):
        for p in [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/TTF/DejaVuSans.ttf",
        ]:
            try:
                return ImageFont.truetype(p, sz)
            except Exception:
                pass
        return ImageFont.load_default()

    d.text((124, 68), "certhub", fill=(230, 237, 243), font=font(34, True))
    d.text((124, 106), "/ shared learning path", fill=(125, 133, 144), font=font(18))

    # accent tag
    d.text((60, 175), f"// by {author}", fill=(57, 255, 106), font=font(22, True))
    # title (wrap simple)
    words = name.split(" ")
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if len(test) > 26 and cur:
            lines.append(cur); cur = w
        else:
            cur = test
    if cur: lines.append(cur)
    y = 215
    for ln in lines[:2]:
        d.text((60, y), ln, fill=(255, 255, 255), font=font(78, True)); y += 84

    # stats row bottom
    d.rectangle([60, 480, W-60, 484], fill=(33, 38, 45))
    d.text((60, 510), "CERTS",  fill=(125, 133, 144), font=font(18, True))
    d.text((60, 538), str(count), fill=(57, 255, 106), font=font(56, True))
    d.text((280, 510), "TOTAL COST", fill=(125, 133, 144), font=font(18, True))
    d.text((280, 538), f"${total}", fill=(255, 176, 32), font=font(56, True))
    d.text((560, 510), "SHARE ID", fill=(125, 133, 144), font=font(18, True))
    d.text((560, 538), share_id, fill=(78, 154, 255), font=font(40, True))
    d.text((W-360, 538), "certhub.app", fill=(125, 133, 144), font=font(28, True))

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return FResponse(content=buf.getvalue(), media_type="image/png",
                     headers={"Cache-Control": "public, max-age=86400"})

# ------------ AI Enrichment (Claude) ------------
class AIQueryIn(BaseModel):
    query: str = Field(min_length=2, max_length=200)

@api.post("/certificates/ai-search")
async def ai_search(payload: AIQueryIn):
    q = payload.query.strip()
    # Check for existing AI cache
    cached = await db.certificates.find_one({"ai_query": q.lower()}, {"_id": 0})
    if cached:
        return cached

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except Exception as e:
        raise HTTPException(status_code=503, detail="AI service unavailable")

    system = (
        "You are an expert IT certifications advisor. Given a certification name or topic query, "
        "respond with ONLY a valid JSON object (no markdown, no code fences) matching this schema:\n"
        "{\n"
        '  "name": "string (official cert name)",\n'
        '  "vendor": "string (issuing org, e.g., AWS, Microsoft, CompTIA)",\n'
        '  "level": "beginner|intermediate|expert",\n'
        '  "domain": "cloud|security|networking|data|devops|management|os|hardware|crm|other",\n'
        '  "price_usd": number (best-effort exam registration price in USD),\n'
        '  "duration_minutes": number (exam duration),\n'
        '  "num_questions": number,\n'
        '  "passing_score": number,\n'
        '  "description": "string (2-3 sentences)",\n'
        '  "prerequisites": "string",\n'
        '  "validity_years": number,\n'
        '  "official_url": "string (URL)",\n'
        '  "docs_url": "string (URL)",\n'
        '  "videos": [{"title": "string", "url": "https://youtube.com/..."}],\n'
        '  "practice_url": "string (URL)"\n'
        "}\n"
        "Return best available real URLs. If certification does not exist, set name to 'NOT_FOUND'."
    )

    chat = LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"],
        session_id=f"aisearch-{uuid.uuid4()}",
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        msg = UserMessage(text=f"Certification query: {q}")
        raw = await chat.send_message(msg)
    except Exception as e:
        logger.exception("LLM error")
        raise HTTPException(status_code=502, detail=f"AI provider error: {str(e)[:200]}")

    # Extract JSON
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text).rsplit("```", 1)[0].strip()
    try:
        data = json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if not m:
            raise HTTPException(status_code=502, detail="AI returned unparseable output")
        data = json.loads(m.group(0))

    if data.get("name", "").strip().upper() == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="No matching certification found")

    slug = re.sub(r"[^a-z0-9]+", "-", data["name"].lower()).strip("-")[:80]
    doc = {
        "id": str(uuid.uuid4()),
        "slug": f"ai-{slug}",
        "name": data.get("name", q),
        "vendor": data.get("vendor", "Unknown"),
        "level": data.get("level", "intermediate"),
        "domain": data.get("domain", "other"),
        "price_usd": float(data.get("price_usd") or 0),
        "currency": "USD",
        "duration_minutes": int(data.get("duration_minutes") or 0),
        "num_questions": int(data.get("num_questions") or 0),
        "passing_score": int(data.get("passing_score") or 0),
        "description": data.get("description", ""),
        "prerequisites": data.get("prerequisites", ""),
        "validity_years": int(data.get("validity_years") or 0),
        "official_url": data.get("official_url", ""),
        "docs_url": data.get("docs_url", ""),
        "videos": data.get("videos", []) or [],
        "practice_url": data.get("practice_url", ""),
        "ai_generated": True,
        "ai_query": q.lower(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    # Upsert into DB (unique by slug)
    await db.certificates.update_one({"slug": doc["slug"]}, {"$set": doc}, upsert=True)
    doc.pop("_id", None)
    return doc

# ------------ Favorites ------------
class FavoriteIn(BaseModel):
    slug: str

@api.get("/favorites")
async def get_favorites(user: dict = Depends(get_current_user)):
    fav = await db.favorites.find_one({"user_id": user["id"]}, {"_id": 0})
    slugs = (fav or {}).get("slugs", [])
    if not slugs:
        return {"items": []}
    certs = await db.certificates.find({"slug": {"$in": slugs}}, {"_id": 0}).to_list(500)
    return {"items": certs}

@api.post("/favorites")
async def add_favorite(payload: FavoriteIn, user: dict = Depends(get_current_user)):
    await db.favorites.update_one(
        {"user_id": user["id"]},
        {"$addToSet": {"slugs": payload.slug}, "$setOnInsert": {"user_id": user["id"]}},
        upsert=True,
    )
    return {"ok": True}

@api.delete("/favorites/{slug}")
async def remove_favorite(slug: str, user: dict = Depends(get_current_user)):
    await db.favorites.update_one({"user_id": user["id"]}, {"$pull": {"slugs": slug}})
    return {"ok": True}

# ------------ Startup ------------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@certhub.com").lower()
    admin_pw = os.environ.get("ADMIN_PASSWORD", "Admin@2026")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Admin",
            "role": "admin",
            "password_hash": hash_password(admin_pw),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_pw, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})

async def seed_certificates():
    for c in CERTIFICATES_SEED:
        doc = {**c, "id": c.get("id", str(uuid.uuid4())), "ai_generated": False}
        await db.certificates.update_one({"slug": c["slug"]}, {"$set": doc}, upsert=True)
    logger.info(f"Seeded {len(CERTIFICATES_SEED)} certificates")

@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.certificates.create_index("slug", unique=True)
    await db.favorites.create_index("user_id", unique=True)
    await seed_admin()
    await seed_certificates()

@app.on_event("shutdown")
async def on_shutdown():
    client.close()

@api.get("/")
async def root():
    return {"service": "CertHub API", "ok": True}

app.include_router(api)

# CORS
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
extra = os.environ.get("CORS_ORIGINS", "").split(",")
allowed = [o.strip() for o in [frontend_url, *extra] if o.strip() and o.strip() != "*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

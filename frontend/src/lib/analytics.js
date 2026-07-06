import { api } from "@/lib/api";

const SESSION_KEY = "certhub_session_id";
const VARIANT_KEY = "certhub_ab_ribbon";

function uid() {
    return (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function sessionId() {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) { sid = uid(); localStorage.setItem(SESSION_KEY, sid); }
    return sid;
}

export function ribbonVariant() {
    let v = localStorage.getItem(VARIANT_KEY);
    if (v !== "A" && v !== "B") {
        v = Math.random() < 0.5 ? "A" : "B";
        localStorage.setItem(VARIANT_KEY, v);
    }
    return v;
}

export function track(name, variant = null, meta = {}) {
    // Fire and forget — never block UI on analytics
    api.post("/analytics/event", { name, variant, meta, session_id: sessionId() }).catch(() => {});
}

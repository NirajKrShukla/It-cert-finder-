import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
    FaArrowLeft, FaBookmark, FaRegBookmark, FaArrowUpRightFromSquare, FaClock, FaCircleQuestion,
    FaGraduationCap, FaCalendarCheck, FaYoutube, FaBookOpen, FaFileLines
} from "react-icons/fa6";

export default function CertificateDetail() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [cert, setCert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/certificates/${slug}`);
                setCert(data);
            } catch (_e) {
                setCert(false);
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    useEffect(() => {
        if (!user || user === false) return;
        api.get("/favorites").then(r => {
            setIsFav(r.data.items.some(c => c.slug === slug));
        }).catch(() => {});
    }, [user, slug]);

    const toggleFav = async () => {
        if (!user || user === false) {
            toast.info("Please log in to save favorites");
            return;
        }
        try {
            if (isFav) {
                await api.delete(`/favorites/${slug}`);
                setIsFav(false);
                toast.success("Removed from favorites");
            } else {
                await api.post("/favorites", { slug });
                setIsFav(true);
                toast.success("Saved to your dashboard");
            }
        } catch (_e) {
            toast.error("Could not update favorites");
        }
    };

    if (loading) return <div className="min-h-[60vh] grid place-items-center font-mono text-xs uppercase tracking-widest text-[#7D8590]">Loading…</div>;
    if (!cert) return (
        <div className="max-w-[1000px] mx-auto p-10">
            <Link to="/" className="btn btn-ghost"><FaArrowLeft /> Back</Link>
            <div className="border border-[#21262D] bg-[#12171F] p-10 mt-6">
                <div className="font-display text-3xl font-semibold">Certificate not found.</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
            <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#7D8590] hover:text-[#39FF6A]" data-testid="back-link">
                <FaArrowLeft /> Back to directory
            </Link>

            <div className="grid lg:grid-cols-12 gap-8 mt-6">
                <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-24 border border-[#21262D] bg-[#12171F] p-7">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">// {cert.vendor}</div>
                        <h1 className="font-display font-semibold text-3xl leading-tight mt-2 text-[#E6EDF3]" data-testid="cert-detail-name">{cert.name}</h1>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className={`chip lvl-${cert.level}`}>{cert.level}</span>
                            <span className="chip">{cert.domain}</span>
                            {cert.ai_generated && <span className="chip chip-magenta">AI enriched</span>}
                        </div>

                        <div className="mt-6 border-t border-[#21262D] pt-5">
                            <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">Exam Cost</div>
                            <div className="font-mono font-bold text-5xl leading-none mt-2 text-[#39FF6A]" data-testid="cert-detail-price">
                                ${cert.price_usd}
                                <span className="font-mono text-sm text-[#7D8590] ml-2">{cert.currency}</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Stat icon={<FaClock/>} label="Duration" value={cert.duration_minutes ? `${cert.duration_minutes} min` : "—"} />
                            <Stat icon={<FaCircleQuestion/>} label="Questions" value={cert.num_questions || "—"} />
                            <Stat icon={<FaGraduationCap/>} label="Pass Score" value={cert.passing_score || "—"} />
                            <Stat icon={<FaCalendarCheck/>} label="Valid For" value={cert.validity_years ? `${cert.validity_years} yr` : "—"} />
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            {cert.official_url && (
                                <a href={cert.official_url} target="_blank" rel="noreferrer" className="btn btn-primary w-full" data-testid="official-link">
                                    View Official Page <FaArrowUpRightFromSquare className="text-xs" />
                                </a>
                            )}
                            <button onClick={toggleFav} className="btn w-full" data-testid="favorite-btn">
                                {isFav ? <FaBookmark /> : <FaRegBookmark />} {isFav ? "Saved" : "Save to Dashboard"}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* RIGHT content */}
                <main className="lg:col-span-8 space-y-8">
                    <Section title="Overview">
                        <p className="text-lg leading-relaxed text-[#B1BAC4]">{cert.description}</p>
                    </Section>

                    {cert.prerequisites && (
                        <Section title="Prerequisites">
                            <p className="text-base leading-relaxed text-[#B1BAC4]">{cert.prerequisites}</p>
                        </Section>
                    )}

                    {(cert.videos?.length > 0) && (
                        <Section title="Best Video Courses">
                            <div className="grid sm:grid-cols-2 gap-3">
                                {cert.videos.map((v, i) => (
                                    <a key={i} href={v.url} target="_blank" rel="noreferrer" className="border border-[#21262D] bg-[#0A0E14] p-4 hover:border-[#39FF6A] transition-colors flex items-start gap-3" data-testid={`video-link-${i}`}>
                                        <FaYoutube className="text-2xl text-[#FF5C57] shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold leading-snug text-[#E6EDF3]">{v.title}</div>
                                            <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590] mt-1 truncate">Watch on YouTube ↗</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </Section>
                    )}

                    <Section title="Learning Docs & Resources">
                        <div className="grid sm:grid-cols-2 gap-3">
                            {cert.docs_url && (
                                <a href={cert.docs_url} target="_blank" rel="noreferrer" className="border border-[#21262D] bg-[#0A0E14] p-5 hover:border-[#39FF6A] transition-colors flex items-start gap-3" data-testid="docs-link">
                                    <FaBookOpen className="text-2xl shrink-0 mt-1 text-[#39FF6A]" />
                                    <div>
                                        <div className="font-semibold text-[#E6EDF3]">Official Study Guide</div>
                                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590] mt-1">Exam objectives & syllabus ↗</div>
                                    </div>
                                </a>
                            )}
                            {cert.practice_url && (
                                <a href={cert.practice_url} target="_blank" rel="noreferrer" className="border border-[#21262D] bg-[#0A0E14] p-5 hover:border-[#39FF6A] transition-colors flex items-start gap-3" data-testid="practice-link">
                                    <FaFileLines className="text-2xl shrink-0 mt-1 text-[#FFB020]" />
                                    <div>
                                        <div className="font-semibold text-[#E6EDF3]">Practice Tests</div>
                                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590] mt-1">Sample questions ↗</div>
                                    </div>
                                </a>
                            )}
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="border border-black p-7 bg-white">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#002FA7]">{title}</div>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function Stat({ icon, label, value }) {
    return (
        <div className="border border-black p-3 bg-[#F4F5F6]">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#52525B]">
                {icon} {label}
            </div>
            <div className="font-display font-bold text-lg mt-1">{value}</div>
        </div>
    );
}

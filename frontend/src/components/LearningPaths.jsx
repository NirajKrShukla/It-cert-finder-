import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { FaArrowRight, FaRoute } from "react-icons/fa6";

const ACCENTS = {
    mint: { text: "text-[#39FF6A]", border: "border-[#39FF6A]", bg: "bg-[#39FF6A]" },
    amber: { text: "text-[#FFB020]", border: "border-[#FFB020]", bg: "bg-[#FFB020]" },
    magenta: { text: "text-[#FF00A8]", border: "border-[#FF00A8]", bg: "bg-[#FF00A8]" },
    blue: { text: "text-[#4E9AFF]", border: "border-[#4E9AFF]", bg: "bg-[#4E9AFF]" },
};

export default function LearningPaths() {
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/paths").then(r => setPaths(r.data.paths || [])).catch(() => {}).finally(() => setLoading(false));
    }, []);

    if (loading || !paths.length) return null;

    return (
        <section className="border-b border-[#21262D]" data-testid="learning-paths-section">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">// curated tracks</div>
                        <h2 className="font-display font-semibold text-4xl mt-2">Learning paths</h2>
                        <p className="text-[#B1BAC4] mt-2">Structured chains that take you from zero to expert.</p>
                    </div>
                    <FaRoute className="text-4xl text-[#39FF6A] hidden md:block" />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    {paths.map(p => {
                        const accent = ACCENTS[p.accent] || ACCENTS.mint;
                        return (
                            <div key={p.id} className="border border-[#21262D] bg-[#12171F] p-6 hover:border-[#39FF6A] transition-colors" data-testid={`path-${p.id}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className={`font-mono text-[10px] uppercase tracking-widest ${accent.text}`}>// {p.id}</div>
                                        <h3 className="font-display font-semibold text-2xl mt-1">{p.name}</h3>
                                        <p className="text-sm text-[#B1BAC4] mt-1">{p.tagline}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">Total</div>
                                        <div className={`font-mono font-bold text-xl ${accent.text}`}>${p.total_cost}</div>
                                    </div>
                                </div>

                                <ol className="mt-5 space-y-2">
                                    {p.certs.map((c, i) => (
                                        <li key={c.slug} className="flex items-center gap-3">
                                            <span className={`w-6 h-6 shrink-0 grid place-items-center border ${accent.border} ${accent.text} font-mono text-[11px] font-bold`}>{i + 1}</span>
                                            <Link to={`/certificate/${c.slug}`} className="flex-1 min-w-0 flex items-center justify-between gap-2 border border-[#21262D] px-3 py-2 hover:border-[#39FF6A] transition-colors group" data-testid={`path-${p.id}-cert-${i}`}>
                                                <span className="truncate text-sm text-[#E6EDF3] group-hover:text-[#39FF6A]">{c.name}</span>
                                                <span className="font-mono text-xs text-[#7D8590] shrink-0">${c.price_usd}</span>
                                            </Link>
                                            {i < p.certs.length - 1 && <FaArrowRight className="text-[10px] text-[#30363D]" />}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

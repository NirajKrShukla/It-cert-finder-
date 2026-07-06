import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { FaArrowLeft, FaChartLine } from "react-icons/fa6";

export default function Analytics() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/analytics/summary")
            .then(r => setData(r.data))
            .catch(e => setErr(e.response?.data?.detail || "Unable to load"))
            .finally(() => setLoading(false));
    }, []);

    const isAdmin = user && user.role === "admin";

    return (
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
            <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#7D8590] hover:text-[#39FF6A]">
                <FaArrowLeft /> Back
            </Link>

            <div className="mt-6 border border-[#21262D] bg-[#12171F] p-8">
                <div className="flex items-center gap-3">
                    <FaChartLine className="text-2xl text-[#39FF6A]" />
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">// admin · analytics</div>
                        <h1 className="font-display font-semibold text-4xl mt-1">A/B & event tracking</h1>
                    </div>
                </div>
            </div>

            {loading && <div className="mt-6 font-mono text-xs text-[#7D8590]">Loading…</div>}
            {err && (
                <div className="mt-6 border border-[#FF5C57] bg-[#2A0F0F] text-[#FF5C57] p-4 font-mono text-sm" data-testid="analytics-err">
                    {err} {!isAdmin && "· Log in as admin (admin@certhub.com) to view."}
                </div>
            )}

            {data && (
                <>
                    <div className="mt-8 border border-[#21262D] bg-[#12171F]">
                        <div className="p-5 border-b border-[#21262D] font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">// ribbon a/b — signup ctr</div>
                        <div className="grid grid-cols-2 divide-x divide-[#21262D]">
                            {["A", "B"].map(v => (
                                <div key={v} className="p-6" data-testid={`ab-variant-${v}`}>
                                    <div className="flex items-baseline justify-between">
                                        <div className={`font-display font-semibold text-3xl ${v === "A" ? "text-[#39FF6A]" : "text-[#FFB020]"}`}>Variant {v}</div>
                                        <div className={`font-mono text-2xl font-bold ${v === "A" ? "text-[#39FF6A]" : "text-[#FFB020]"}`}>{data.ab_ribbon[v].ctr}%</div>
                                    </div>
                                    <div className="mt-1 font-mono text-[11px] text-[#7D8590]">
                                        {v === "A" ? "Start with a free cert." : "Get certified this weekend — for $0."}
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <Stat label="Views" v={data.ab_ribbon[v].views} />
                                        <Stat label="Sign-up clicks" v={data.ab_ribbon[v].clicks} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 border border-[#21262D] bg-[#12171F]">
                        <div className="p-5 border-b border-[#21262D] font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">// all events</div>
                        <table className="w-full text-sm">
                            <thead className="bg-[#0A0E14]">
                                <tr className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">
                                    <th className="text-left p-4">Event</th>
                                    <th className="text-left p-4">Variant</th>
                                    <th className="text-right p-4">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.events.map((e, i) => (
                                    <tr key={i} className="border-t border-[#21262D]">
                                        <td className="p-4 font-mono text-[#E6EDF3]">{e.name}</td>
                                        <td className="p-4 font-mono text-[#7D8590]">{e.variant || "—"}</td>
                                        <td className="p-4 text-right font-mono font-bold text-[#39FF6A]">{e.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

function Stat({ label, v }) {
    return (
        <div className="border border-[#21262D] bg-[#0A0E14] p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">{label}</div>
            <div className="font-display font-semibold text-2xl mt-1 text-[#E6EDF3]">{v}</div>
        </div>
    );
}

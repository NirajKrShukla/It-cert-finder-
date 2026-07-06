import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { FaArrowLeft, FaCodeCompare } from "react-icons/fa6";

const ROWS = [
    { k: "vendor", label: "Vendor" },
    { k: "level", label: "Level" },
    { k: "domain", label: "Domain" },
    { k: "price_usd", label: "Exam Cost", fmt: v => `$${v}` },
    { k: "duration_minutes", label: "Duration", fmt: v => v ? `${v} min` : "—" },
    { k: "num_questions", label: "Questions", fmt: v => v || "—" },
    { k: "passing_score", label: "Passing Score", fmt: v => v || "—" },
    { k: "validity_years", label: "Valid For", fmt: v => v ? `${v} yr` : "—" },
    { k: "prerequisites", label: "Prerequisites", fmt: v => v || "—" },
    { k: "description", label: "Description" },
];

export default function Compare() {
    const [params, setParams] = useSearchParams();
    const [all, setAll] = useState([]);
    const a = params.get("a") || "";
    const b = params.get("b") || "";
    const [ca, setCa] = useState(null);
    const [cb, setCb] = useState(null);

    useEffect(() => {
        api.get("/certificates", { params: { limit: 500 } }).then(r => setAll(r.data.items || []));
    }, []);
    useEffect(() => { a ? api.get(`/certificates/${a}`).then(r => setCa(r.data)).catch(() => setCa(null)) : setCa(null); }, [a]);
    useEffect(() => { b ? api.get(`/certificates/${b}`).then(r => setCb(r.data)).catch(() => setCb(null)) : setCb(null); }, [b]);

    const setSlot = (slot, v) => { params.set(slot, v); setParams(params, { replace: true }); };

    const Picker = ({ slot, val, testid }) => (
        <select value={val} onChange={e => setSlot(slot, e.target.value)} className="input font-mono text-sm" data-testid={testid}>
            <option value="">Select certificate…</option>
            {all.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
    );

    const cell = (cert, row) => {
        if (!cert) return <span className="text-[#7D8590]">—</span>;
        const raw = cert[row.k];
        const val = row.fmt ? row.fmt(raw) : (raw || "—");
        return <span className="text-[#E6EDF3] break-words">{val}</span>;
    };

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
            <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#7D8590] hover:text-[#39FF6A]">
                <FaArrowLeft /> Directory
            </Link>

            <div className="mt-6 border border-[#21262D] bg-[#12171F] p-7">
                <div className="flex items-center gap-3">
                    <FaCodeCompare className="text-2xl text-[#39FF6A]" />
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">// diff --certs</div>
                        <h1 className="font-display font-semibold text-4xl mt-1">Compare certifications</h1>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <Picker slot="a" val={a} testid="compare-picker-a" />
                    <Picker slot="b" val={b} testid="compare-picker-b" />
                </div>
            </div>

            <div className="mt-6 border border-[#21262D] bg-[#12171F] overflow-hidden" data-testid="compare-table">
                <div className="grid grid-cols-3 border-b border-[#21262D] bg-[#0A0E14]">
                    <div className="p-5 font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">// attribute</div>
                    <div className="p-5 border-l border-[#21262D]">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">CERT A</div>
                        <div className="font-display font-semibold text-lg mt-1 leading-tight">{ca ? ca.name : "—"}</div>
                    </div>
                    <div className="p-5 border-l border-[#21262D]">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#FFB020]">CERT B</div>
                        <div className="font-display font-semibold text-lg mt-1 leading-tight">{cb ? cb.name : "—"}</div>
                    </div>
                </div>
                {ROWS.map((r, i) => (
                    <div key={r.k} className={`grid grid-cols-3 border-b border-[#21262D] ${i % 2 ? "bg-[#0F131A]" : ""}`}>
                        <div className="p-4 font-mono text-[11px] uppercase tracking-widest text-[#7D8590]">{r.label}</div>
                        <div className="p-4 border-l border-[#21262D] text-sm">{cell(ca, r)}</div>
                        <div className="p-4 border-l border-[#21262D] text-sm">{cell(cb, r)}</div>
                    </div>
                ))}
                <div className="grid grid-cols-3">
                    <div className="p-4 font-mono text-[11px] uppercase tracking-widest text-[#7D8590]">Docs</div>
                    <div className="p-4 border-l border-[#21262D] text-sm">
                        {ca?.official_url ? <a href={ca.official_url} target="_blank" rel="noreferrer" className="text-[#39FF6A] hover:underline">Official ↗</a> : "—"}
                    </div>
                    <div className="p-4 border-l border-[#21262D] text-sm">
                        {cb?.official_url ? <a href={cb.official_url} target="_blank" rel="noreferrer" className="text-[#39FF6A] hover:underline">Official ↗</a> : "—"}
                    </div>
                </div>
            </div>
        </div>
    );
}

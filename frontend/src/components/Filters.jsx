import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const LEVELS = ["beginner", "intermediate", "expert"];

export default function Filters({ filters, setFilters }) {
    const [facets, setFacets] = useState({ vendors: [], domains: [], levels: LEVELS });

    useEffect(() => {
        api.get("/certificates/facets").then(r => setFacets(r.data)).catch(() => {});
    }, []);

    const toggle = (key, val) => {
        const current = filters[key] ? filters[key].split(",").filter(Boolean) : [];
        const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
        setFilters({ ...filters, [key]: next.join(",") });
    };

    const isActive = (key, val) => (filters[key] || "").split(",").includes(val);

    const clearAll = () => setFilters({ q: filters.q || "" });
    const activeCount = ["vendor","level","domain","min_price","max_price"].filter(k => filters[k]).length;

    return (
        <aside className="border border-[#21262D] bg-[#12171F]" data-testid="filters-sidebar">
            <div className="px-5 py-4 border-b border-[#21262D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[#39FF6A] font-mono text-sm">▶</span>
                    <h3 className="font-display font-semibold text-lg">Filter</h3>
                    {activeCount > 0 && <span className="chip chip-mint">{activeCount}</span>}
                </div>
                <button onClick={clearAll} className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590] hover:text-[#39FF6A]" data-testid="filters-clear">
                    Clear
                </button>
            </div>

            <Section title="Level">
                {facets.levels.map(l => (
                    <FilterItem key={l} active={isActive("level", l)} onClick={() => toggle("level", l)} testid={`filter-level-${l}`}>{l}</FilterItem>
                ))}
            </Section>

            <Section title="Domain">
                {facets.domains.map(d => (
                    <FilterItem key={d} active={isActive("domain", d)} onClick={() => toggle("domain", d)} testid={`filter-domain-${d}`}>{d}</FilterItem>
                ))}
            </Section>

            <Section title="Vendor">
                {facets.vendors.map(v => (
                    <FilterItem key={v} active={isActive("vendor", v)} onClick={() => toggle("vendor", v)} testid={`filter-vendor-${v.replace(/\s+/g,'-').toLowerCase()}`}>{v}</FilterItem>
                ))}
            </Section>

            <Section title="Price (USD)">
                <button
                    onClick={() => setFilters({ ...filters, max_price: filters.max_price === "0" ? "" : "0", min_price: "" })}
                    className={`chip w-full justify-center ${filters.max_price === "0" ? "active" : "chip-mint"}`}
                    data-testid="filter-free-only"
                >
                    {filters.max_price === "0" ? "✓ Free only" : "🎁 Free certifications only"}
                </button>
                <div className="flex items-center gap-2 w-full mt-2">
                    <input type="number" placeholder="Min" className="input font-mono text-sm !py-2"
                        value={filters.min_price || ""} onChange={e => setFilters({ ...filters, min_price: e.target.value })}
                        data-testid="filter-min-price" />
                    <span className="font-mono text-xs text-[#7D8590]">→</span>
                    <input type="number" placeholder="Max" className="input font-mono text-sm !py-2"
                        value={filters.max_price || ""} onChange={e => setFilters({ ...filters, max_price: e.target.value })}
                        data-testid="filter-max-price" />
                </div>
            </Section>
        </aside>
    );
}

function Section({ title, children }) {
    return (
        <div className="border-b border-[#21262D]">
            <div className="px-5 pt-5 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#39FF6A]">// {title}</div>
            <div className="flex flex-wrap gap-1.5 px-5 pb-4">{children}</div>
        </div>
    );
}

function FilterItem({ active, onClick, children, testid }) {
    return (
        <button onClick={onClick} data-testid={testid} className={`chip capitalize ${active ? "active" : ""}`}>
            {children}
        </button>
    );
}

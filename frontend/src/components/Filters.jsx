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

    return (
        <aside className="border border-black bg-white" data-testid="filters-sidebar">
            <div className="p-5 border-b border-black flex items-center justify-between">
                <h3 className="font-display font-bold text-lg">Filter</h3>
                <button onClick={clearAll} className="font-mono text-[10px] uppercase tracking-widest hover:text-[#002FA7]" data-testid="filters-clear">
                    Clear all
                </button>
            </div>

            <FilterSection title="Level">
                {facets.levels.map(l => (
                    <FilterItem key={l} active={isActive("level", l)} onClick={() => toggle("level", l)} testid={`filter-level-${l}`}>
                        {l}
                    </FilterItem>
                ))}
            </FilterSection>

            <FilterSection title="Vendor">
                {facets.vendors.map(v => (
                    <FilterItem key={v} active={isActive("vendor", v)} onClick={() => toggle("vendor", v)} testid={`filter-vendor-${v.replace(/\s+/g,'-').toLowerCase()}`}>
                        {v}
                    </FilterItem>
                ))}
            </FilterSection>

            <FilterSection title="Domain">
                {facets.domains.map(d => (
                    <FilterItem key={d} active={isActive("domain", d)} onClick={() => toggle("domain", d)} testid={`filter-domain-${d}`}>
                        {d}
                    </FilterItem>
                ))}
            </FilterSection>

            <FilterSection title="Price (USD)">
                <div className="flex items-center gap-2 px-5 pb-5">
                    <input
                        type="number"
                        placeholder="Min"
                        className="hard-input font-mono text-sm"
                        value={filters.min_price || ""}
                        onChange={e => setFilters({ ...filters, min_price: e.target.value })}
                        data-testid="filter-min-price"
                    />
                    <span className="font-mono text-xs">—</span>
                    <input
                        type="number"
                        placeholder="Max"
                        className="hard-input font-mono text-sm"
                        value={filters.max_price || ""}
                        onChange={e => setFilters({ ...filters, max_price: e.target.value })}
                        data-testid="filter-max-price"
                    />
                </div>
            </FilterSection>
        </aside>
    );
}

function FilterSection({ title, children }) {
    return (
        <div className="border-b border-black">
            <div className="px-5 pt-5 pb-2 font-mono text-[10px] uppercase tracking-widest text-[#52525B]">{title}</div>
            <div className="flex flex-wrap gap-2 px-5 pb-4">{children}</div>
        </div>
    );
}

function FilterItem({ active, onClick, children, testid }) {
    return (
        <button
            onClick={onClick}
            data-testid={testid}
            className={`badge-mono cursor-pointer capitalize ${active ? "badge-blue" : "hover:bg-[#E4FF00]"}`}
        >
            {children}
        </button>
    );
}

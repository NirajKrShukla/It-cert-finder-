import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import Filters from "@/components/Filters";
import CertificateCard from "@/components/CertificateCard";
import LearningPaths from "@/components/LearningPaths";
import { FaMagnifyingGlass, FaWandMagicSparkles, FaArrowRight, FaBoltLightning, FaCircleNodes } from "react-icons/fa6";
import { toast } from "sonner";

export default function Home() {
    const [params, setParams] = useSearchParams();
    const initialFilters = useMemo(() => {
        const o = {};
        for (const [k, v] of params.entries()) o[k] = v;
        return o;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [filters, setFilters] = useState(initialFilters);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("featured");
    const [aiLoading, setAiLoading] = useState(false);
    const [queryInput, setQueryInput] = useState(filters.q || "");
    const [stats, setStats] = useState({ vendors: 0, domains: 0 });

    useEffect(() => {
        const clean = {};
        Object.entries(filters).forEach(([k, v]) => { if (v) clean[k] = v; });
        setParams(clean, { replace: true });
    }, [filters, setParams]);

    useEffect(() => {
        api.get("/certificates/facets").then(r => setStats({ vendors: r.data.vendors.length, domains: r.data.domains.length })).catch(() => {});
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/certificates", { params: { ...filters, sort } });
            setItems(data.items || []);
        } catch (_e) { setItems([]); }
        finally { setLoading(false); }
    }, [filters, sort]);

    useEffect(() => { load(); }, [load]);

    const runSearch = (e) => { e?.preventDefault(); setFilters({ ...filters, q: queryInput }); };

    const aiEnrich = async () => {
        if (!queryInput.trim()) return toast.info("Type a certification name first");
        setAiLoading(true);
        try {
            const { data } = await api.post("/certificates/ai-search", { query: queryInput });
            toast.success(`AI added: ${data.name}`);
            setFilters({ ...filters, q: data.name });
            setQueryInput(data.name);
        } catch (e) {
            toast.error(e.response?.data?.detail || "AI enrichment failed");
        } finally { setAiLoading(false); }
    };

    const cheapest = items.length ? Math.min(...items.map(i => i.price_usd || 0)) : 0;
    const priciest = items.length ? Math.max(...items.map(i => i.price_usd || 0)) : 0;

    return (
        <div>
            {/* HERO */}
            <section className="relative border-b border-[#21262D] overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-24 relative">
                    <div className="grid lg:grid-cols-12 gap-10 items-start">
                        <div className="lg:col-span-8">
                            <div className="font-mono text-xs text-[#7D8590]">
                                <span className="text-[#39FF6A]">$</span> certhub --index --year=2026
                            </div>
                            <h1 className="font-display font-semibold text-5xl sm:text-6xl lg:text-[80px] leading-[0.95] mt-6 tracking-tight" data-testid="hero-heading">
                                Every IT cert.<br/>
                                <span className="text-[#7D8590]">Zero fluff.</span><br/>
                                <span className="text-[#39FF6A] glow-mint cursor">One terminal</span>
                            </h1>
                            <p className="mt-8 text-lg text-[#B1BAC4] max-w-2xl leading-relaxed">
                                Search <span className="text-[#39FF6A] font-mono">{items.length || 55}+</span> curated IT certifications — cloud, AI, security, databases, Java. Real pricing, official docs, and the best learning videos. Plus AI-powered lookup for anything we're missing.
                            </p>

                            {/* SEARCH */}
                            <form onSubmit={runSearch} className="mt-10 border border-[#30363D] bg-[#12171F] flex flex-col sm:flex-row" data-testid="hero-search-form">
                                <div className="flex-1 relative flex items-center border-b sm:border-b-0 sm:border-r border-[#21262D]">
                                    <span className="font-mono text-[#39FF6A] px-5 select-none">›</span>
                                    <input
                                        data-testid="search-input"
                                        value={queryInput}
                                        onChange={e => setQueryInput(e.target.value)}
                                        placeholder="grep 'aws' | 'ckad' | 'ocp java' | 'security+'"
                                        className="bg-transparent border-0 outline-0 py-5 pr-4 text-base w-full font-mono placeholder:text-[#586069] text-[#E6EDF3]"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary !py-5 !px-8" data-testid="search-submit-btn">
                                    <FaMagnifyingGlass className="text-sm" /> Search
                                </button>
                                <button type="button" onClick={aiEnrich} disabled={aiLoading} className="btn !py-5 !px-6" data-testid="ai-search-btn">
                                    <FaWandMagicSparkles /> {aiLoading ? "…" : "AI"}
                                </button>
                            </form>

                            <div className="mt-4 flex flex-wrap gap-2 items-center font-mono text-[11px] text-[#7D8590]">
                                <span>Try:</span>
                                <button onClick={() => { setQueryInput(""); setFilters({ max_price: "0" }); }}
                                    className="border border-[#39FF6A] text-[#39FF6A] px-2 py-1 hover:bg-[#39FF6A] hover:text-[#0A0E14] transition-colors font-bold"
                                    data-testid="quick-search-free">
                                    🎁 Free only
                                </button>
                                {["AWS AI Practitioner", "CKA", "CISSP", "Oracle Java 21", "MongoDB", "AZ-104"].map(q => (
                                    <button key={q} onClick={() => { setQueryInput(q); setFilters({ ...filters, q }); }}
                                        className="border border-[#30363D] px-2 py-1 hover:border-[#39FF6A] hover:text-[#39FF6A] transition-colors"
                                        data-testid={`quick-search-${q.replace(/\s+/g,'-').toLowerCase()}`}>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-3">
                            <StatBox label="Certifications" value={items.length || "…"} accent="mint" testid="stat-count" />
                            <div className="grid grid-cols-2 gap-3">
                                <StatBox label="Vendors" value={stats.vendors || "…"} accent="amber" />
                                <StatBox label="Domains" value={stats.domains || "…"} accent="magenta" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <StatBox label="Cheapest" value={cheapest ? `$${cheapest}` : "—"} accent="blue" />
                                <StatBox label="Priciest" value={priciest ? `$${priciest}` : "—"} accent="mint" />
                            </div>
                            <div className="border border-[#21262D] bg-[#12171F] p-4">
                                <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">// hot categories</div>
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {["cloud","ai","security","database","devops","programming"].map(d => (
                                        <button key={d} onClick={() => setFilters({ ...filters, domain: d })}
                                            className="chip capitalize" data-testid={`hero-cat-${d}`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* LEARNING PATHS */}
            <LearningPaths />

            {/* LISTING */}
            <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">
                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3">
                        <div className="lg:sticky lg:top-24">
                            <Filters filters={filters} setFilters={setFilters} />
                        </div>
                    </div>

                    <div className="lg:col-span-9">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#21262D]">
                            <div className="flex items-baseline gap-3">
                                <FaCircleNodes className="text-[#39FF6A]" />
                                <div>
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">// results</div>
                                    <div className="font-display font-semibold text-2xl mt-1" data-testid="results-count">
                                        {loading ? "…" : items.length} {items.length === 1 ? "certificate" : "certificates"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590] hidden sm:block">Sort</label>
                                <select value={sort} onChange={e => setSort(e.target.value)}
                                    className="input !py-2 !w-auto font-mono text-xs uppercase tracking-widest" data-testid="sort-select">
                                    <option value="featured">Featured</option>
                                    <option value="price_asc">Price ↑</option>
                                    <option value="price_desc">Price ↓</option>
                                    <option value="name">A → Z</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="border border-[#21262D] h-64 bg-[#12171F] animate-pulse" />)}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="border border-[#21262D] bg-[#12171F] p-12 text-center" data-testid="empty-state">
                                <FaBoltLightning className="text-4xl text-[#39FF6A] mx-auto" />
                                <div className="font-display text-3xl font-semibold mt-4">No matches in the index.</div>
                                <p className="mt-2 text-[#B1BAC4]">Try clearing filters — or fire the AI to lookup any certification we don't have yet.</p>
                                <button onClick={aiEnrich} className="btn btn-primary mt-6" disabled={aiLoading}>
                                    <FaWandMagicSparkles /> {aiLoading ? "Enriching…" : "Ask AI"} <FaArrowRight />
                                </button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="cert-grid">
                                {items.map(c => <CertificateCard key={c.slug} cert={c} />)}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <footer className="border-t border-[#21262D] mt-16 py-8 bg-[#0A0E14]">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-xl">cert<span className="text-[#39FF6A]">hub</span></span>
                        <span className="font-mono text-xs text-[#7D8590]">// built for engineers, © 2026</span>
                    </div>
                    <div className="font-mono text-[11px] text-[#7D8590]">
                        <Link to="/register" className="hover:text-[#39FF6A]">create_account()</Link> ·{" "}
                        <Link to="/dashboard" className="hover:text-[#39FF6A]">my_dashboard()</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function StatBox({ label, value, accent = "mint", testid }) {
    const colors = {
        mint: "text-[#39FF6A]",
        amber: "text-[#FFB020]",
        magenta: "text-[#FF00A8]",
        blue: "text-[#4E9AFF]",
    };
    return (
        <div className="border border-[#21262D] bg-[#12171F] p-4" data-testid={testid}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">{label}</div>
            <div className={`font-display font-semibold text-3xl mt-1 ${colors[accent]}`}>{value}</div>
        </div>
    );
}

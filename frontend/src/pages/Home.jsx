import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import Filters from "@/components/Filters";
import CertificateCard from "@/components/CertificateCard";
import { FaMagnifyingGlass, FaWandMagicSparkles, FaArrowRight } from "react-icons/fa6";
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

    // Sync url
    useEffect(() => {
        const clean = {};
        Object.entries(filters).forEach(([k, v]) => { if (v) clean[k] = v; });
        setParams(clean, { replace: true });
    }, [filters, setParams]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/certificates", { params: { ...filters, sort } });
            setItems(data.items || []);
        } catch (_e) {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [filters, sort]);

    useEffect(() => { load(); }, [load]);

    const runSearch = (e) => {
        e?.preventDefault();
        setFilters({ ...filters, q: queryInput });
    };

    const aiEnrich = async () => {
        if (!queryInput.trim()) return;
        setAiLoading(true);
        try {
            const { data } = await api.post("/certificates/ai-search", { query: queryInput });
            toast.success(`AI added: ${data.name}`);
            setFilters({ ...filters, q: data.name });
            setQueryInput(data.name);
        } catch (e) {
            toast.error(e.response?.data?.detail || "AI enrichment failed");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="grain">
            {/* HERO */}
            <section className="border-b border-black bg-white">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-12 gap-8 items-end">
                        <div className="lg:col-span-8">
                            <div className="font-mono text-xs uppercase tracking-widest text-[#002FA7]">
                                / The IT Certifications Index — v2026.02
                            </div>
                            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mt-6" data-testid="hero-heading">
                                Every IT cert.<br/>
                                One brutally<br/>
                                <span className="bg-[#E4FF00] px-3 -mx-1 inline-block">honest directory.</span>
                            </h1>
                            <p className="mt-6 text-lg text-[#52525B] max-w-2xl leading-relaxed">
                                Search 30+ curated IT certifications with real pricing, exam length, prerequisites, and the best learning docs & YouTube courses — plus AI-powered lookup for anything else.
                            </p>
                        </div>
                        <div className="lg:col-span-4 hidden lg:block">
                            <div className="border border-black p-6 bg-[#F4F5F6]">
                                <div className="font-mono text-[10px] uppercase tracking-widest">Featured stack</div>
                                <div className="font-display text-3xl font-bold mt-2 leading-tight">Cloud · Security · DevOps · Data</div>
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    <span className="badge-mono">AWS</span>
                                    <span className="badge-mono">AZURE</span>
                                    <span className="badge-mono">GCP</span>
                                    <span className="badge-mono badge-yellow">CISSP</span>
                                    <span className="badge-mono">CKA</span>
                                    <span className="badge-mono">CCNA</span>
                                    <span className="badge-mono badge-blue">PMP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEARCH BAR */}
                    <form onSubmit={runSearch} className="mt-12 grid grid-cols-12 gap-3" data-testid="hero-search-form">
                        <div className="col-span-12 md:col-span-9 relative">
                            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" />
                            <input
                                data-testid="search-input"
                                value={queryInput}
                                onChange={e => setQueryInput(e.target.value)}
                                placeholder="Search AWS, Security+, CKA, Terraform…"
                                className="hard-input pl-12 !py-5 text-lg font-medium"
                            />
                        </div>
                        <div className="col-span-6 md:col-span-1.5 flex">
                            <button type="submit" className="hard-btn hard-btn-blue w-full !py-5" data-testid="search-submit-btn">
                                Search
                            </button>
                        </div>
                        <div className="col-span-6 md:col-span-1.5 flex">
                            <button type="button" onClick={aiEnrich} disabled={aiLoading} className="hard-btn hard-btn-outline w-full !py-5" data-testid="ai-search-btn">
                                <FaWandMagicSparkles /> {aiLoading ? "…" : "AI"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* LISTING */}
            <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3">
                        <div className="lg:sticky lg:top-24">
                            <Filters filters={filters} setFilters={setFilters} />
                        </div>
                    </div>

                    <div className="lg:col-span-9">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-black">
                            <div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-[#52525B]">Results</div>
                                <div className="font-display font-bold text-2xl mt-1" data-testid="results-count">
                                    {loading ? "…" : items.length} {items.length === 1 ? "certificate" : "certificates"}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-[#52525B]">Sort</label>
                                <select
                                    value={sort}
                                    onChange={e => setSort(e.target.value)}
                                    className="hard-input !py-2 !w-auto font-mono text-xs uppercase tracking-widest"
                                    data-testid="sort-select"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price_asc">Price ↑</option>
                                    <option value="price_desc">Price ↓</option>
                                    <option value="name">A → Z</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="border border-black h-64 bg-[#F4F5F6] animate-pulse" />
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="border border-black p-10 text-center" data-testid="empty-state">
                                <div className="font-display text-3xl font-bold">No certificates match.</div>
                                <p className="mt-2 text-[#52525B]">Try clearing filters or use <b>AI search</b> to look up any certification not yet in the directory.</p>
                                <button onClick={aiEnrich} className="hard-btn hard-btn-blue mt-6" disabled={aiLoading}>
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

            <footer className="border-t border-black mt-16 py-10">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="font-display font-bold text-2xl">CERTHUB<span className="text-[#002FA7]">.</span></div>
                    <div className="font-mono text-xs uppercase tracking-widest text-[#52525B]">
                        Built for engineers, by engineers · © 2026
                    </div>
                </div>
            </footer>
        </div>
    );
}

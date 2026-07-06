import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import CertificateCard from "@/components/CertificateCard";
import { FaBookmark, FaArrowRight, FaShareNodes } from "react-icons/fa6";
import { toast } from "sonner";

export default function Dashboard() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        api.get("/favorites")
            .then(r => setItems(r.data.items || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const share = async () => {
        if (!items.length) return toast.info("Save some certs first");
        const name = prompt("Name your public learning path:", `${user?.name || "My"}'s Path`);
        if (!name) return;
        setSharing(true);
        try {
            const { data } = await api.post("/shared-paths", { name, slugs: items.map(i => i.slug) });
            const url = `${window.location.origin}${data.url}`;
            await navigator.clipboard.writeText(url);
            toast.success("Public link copied to clipboard");
            window.open(data.url, "_blank");
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to create share link");
        } finally { setSharing(false); }
    };

    const total = items.reduce((s, c) => s + (c.price_usd || 0), 0);

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
            <div className="border border-[#21262D] bg-[#12171F] p-8 relative overflow-hidden" data-testid="dashboard-hero">
                <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
                <div className="relative">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">// /dashboard</div>
                    <h1 className="font-display font-semibold text-4xl sm:text-5xl mt-2 leading-tight">
                        Welcome back, <span className="text-[#39FF6A]">{user?.name || "friend"}</span>
                    </h1>
                    <p className="text-[#B1BAC4] mt-3">Your certification path. Saved & organised.</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 max-w-xl">
                        <div className="border border-[#21262D] bg-[#0A0E14] p-4">
                            <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">Saved</div>
                            <div className="font-display font-semibold text-3xl text-[#39FF6A]" data-testid="dashboard-count">{loading ? "…" : items.length}</div>
                        </div>
                        <div className="border border-[#21262D] bg-[#0A0E14] p-4">
                            <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">Total exam cost</div>
                            <div className="font-display font-semibold text-3xl text-[#FFB020]">${total}</div>
                        </div>
                        <div className="border border-[#21262D] bg-[#0A0E14] p-4">
                            <div className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">Domains</div>
                            <div className="font-display font-semibold text-3xl text-[#4E9AFF]">{new Set(items.map(c => c.domain)).size}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex items-center justify-between pb-4 border-b border-[#21262D]">
                <div className="flex items-center gap-3">
                    <FaBookmark className="text-lg text-[#39FF6A]" />
                    <div className="font-mono text-[11px] uppercase tracking-widest text-[#7D8590]">// your saved certifications</div>
                </div>
                <Link to="/" className="btn" data-testid="dashboard-browse">Browse directory <FaArrowRight /></Link>
                <button onClick={share} disabled={sharing || !items.length} className="btn btn-primary ml-2" data-testid="share-path-btn">
                    <FaShareNodes /> {sharing ? "Creating…" : "Share as public path"}
                </button>
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="border border-[#21262D] h-64 bg-[#12171F] animate-pulse" />)}
                </div>
            ) : items.length === 0 ? (
                <div className="border border-[#21262D] bg-[#12171F] p-10 mt-8 text-center" data-testid="dashboard-empty">
                    <div className="font-display font-semibold text-3xl">Empty inbox.</div>
                    <p className="text-[#B1BAC4] mt-2">Bookmark certifications from the directory to start your path.</p>
                    <Link to="/" className="btn btn-primary mt-6 inline-flex">Explore certifications <FaArrowRight /></Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8" data-testid="dashboard-grid">
                    {items.map(c => <CertificateCard key={c.slug} cert={c} />)}
                </div>
            )}
        </div>
    );
}

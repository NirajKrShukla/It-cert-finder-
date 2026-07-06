import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import CertificateCard from "@/components/CertificateCard";
import { FaBookmark } from "react-icons/fa6";

export default function Dashboard() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/favorites")
            .then(r => setItems(r.data.items || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
            <div className="border border-black p-8 bg-[#F4F5F6]" data-testid="dashboard-hero">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#002FA7]">/ Your Dashboard</div>
                <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2 leading-tight">
                    Welcome, <span className="bg-[#E4FF00] px-2">{user?.name || "friend"}</span>
                </h1>
                <p className="text-[#52525B] mt-3">Saved certificates — resume learning, compare pricing, plan your path.</p>
            </div>

            <div className="mt-10 flex items-center justify-between pb-4 border-b border-black">
                <div className="flex items-center gap-3">
                    <FaBookmark className="text-lg" />
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#52525B]">Saved</div>
                        <div className="font-display font-bold text-2xl" data-testid="dashboard-count">{loading ? "…" : items.length}</div>
                    </div>
                </div>
                <Link to="/" className="hard-btn hard-btn-outline" data-testid="dashboard-browse">Browse directory →</Link>
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="border border-black h-64 bg-[#F4F5F6] animate-pulse" />)}
                </div>
            ) : items.length === 0 ? (
                <div className="border border-black p-10 mt-8 text-center" data-testid="dashboard-empty">
                    <div className="font-display font-bold text-3xl">No saved certificates yet.</div>
                    <p className="text-[#52525B] mt-2">Head to the directory and bookmark ones you want to earn.</p>
                    <Link to="/" className="hard-btn hard-btn-blue mt-6 inline-flex">Explore certifications →</Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8" data-testid="dashboard-grid">
                    {items.map(c => <CertificateCard key={c.slug} cert={c} />)}
                </div>
            )}
        </div>
    );
}

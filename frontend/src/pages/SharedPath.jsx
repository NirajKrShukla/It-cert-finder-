import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import CertificateCard from "@/components/CertificateCard";
import { FaArrowLeft, FaCopy, FaRoute } from "react-icons/fa6";
import { toast } from "sonner";

export default function SharedPath() {
    const { shareId } = useParams();
    const [path, setPath] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/shared-paths/${shareId}`)
            .then(r => setPath(r.data))
            .catch(() => setPath(false))
            .finally(() => setLoading(false));
    }, [shareId]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied");
    };

    if (loading) return <div className="min-h-[60vh] grid place-items-center font-mono text-xs uppercase tracking-widest text-[#7D8590]">Loading…</div>;
    if (!path) return (
        <div className="max-w-[900px] mx-auto p-10">
            <Link to="/" className="btn btn-ghost"><FaArrowLeft /> Back</Link>
            <div className="border border-[#21262D] bg-[#12171F] p-10 mt-6 text-center">
                <div className="font-display text-3xl font-semibold">Path not found.</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
            <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#7D8590] hover:text-[#39FF6A]">
                <FaArrowLeft /> Directory
            </Link>

            <div className="border border-[#21262D] bg-[#12171F] p-8 mt-6 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">// shared learning path by {path.author_name}</div>
                        <h1 className="font-display font-semibold text-4xl sm:text-5xl mt-2 leading-tight" data-testid="shared-path-name">{path.name}</h1>
                        <p className="text-[#B1BAC4] mt-3 font-mono text-sm">{path.certs.length} certificates · Total ${path.total_cost}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaRoute className="text-3xl text-[#39FF6A] hidden md:block" />
                        <button onClick={copyLink} className="btn" data-testid="copy-link-btn"><FaCopy /> Copy link</button>
                    </div>
                </div>
            </div>

            {path.certs.length === 0 ? (
                <div className="border border-[#21262D] bg-[#12171F] p-10 mt-8 text-center">
                    <div className="font-display font-semibold text-2xl">This path has no certificates.</div>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8" data-testid="shared-grid">
                    {path.certs.map(c => <CertificateCard key={c.slug} cert={c} />)}
                </div>
            )}
        </div>
    );
}

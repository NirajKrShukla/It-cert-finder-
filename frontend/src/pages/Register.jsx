import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { FaBolt } from "react-icons/fa6";

export default function Register() {
    const { register } = useAuth();
    const nav = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await register(email, password, name);
        setLoading(false);
        if (res.ok) {
            toast.success("Account created");
            nav("/dashboard");
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="max-w-md mx-auto px-6 py-16">
            <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-3xl">
                <span className="h-8 w-8 grid place-items-center bg-[#002FA7] text-white"><FaBolt /></span>
                CERT<span className="text-[#002FA7]">HUB</span>
            </Link>

            <div className="border border-black mt-10 p-8 bg-white">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#002FA7]">/ Join</div>
                <h1 className="font-display font-bold text-4xl mt-2">Create account</h1>

                <form onSubmit={onSubmit} className="mt-8 space-y-4" data-testid="register-form">
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest">Full name</label>
                        <input required value={name} onChange={e => setName(e.target.value)} className="hard-input mt-2" data-testid="register-name" />
                    </div>
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="hard-input mt-2" data-testid="register-email" />
                    </div>
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest">Password (min 6)</label>
                        <input type="password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} className="hard-input mt-2" data-testid="register-password" />
                    </div>
                    {error && <div className="border border-[#FF3B30] bg-[#FFEBEA] text-[#FF3B30] p-3 text-sm font-mono" data-testid="register-error">{error}</div>}
                    <button type="submit" disabled={loading} className="hard-btn hard-btn-blue w-full !py-4" data-testid="register-submit">
                        {loading ? "Creating…" : "Create account →"}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-black font-mono text-xs">
                    Already have one? <Link to="/login" className="underline underline-offset-2 hover:text-[#002FA7]" data-testid="link-to-login">Log in</Link>
                </div>
            </div>
        </div>
    );
}

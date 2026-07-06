import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { FaTerminal } from "react-icons/fa6";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError("");
        const res = await login(email, password);
        setLoading(false);
        if (res.ok) { toast.success("Welcome back"); nav("/dashboard"); }
        else setError(res.error);
    };

    return (
        <div className="max-w-md mx-auto px-6 py-16">
            <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-3xl">
                <span className="h-8 w-8 grid place-items-center bg-[#39FF6A] text-[#0A0E14]"><FaTerminal className="text-sm" /></span>
                cert<span className="text-[#39FF6A]">hub</span>
            </Link>

            <div className="border border-[#21262D] mt-10 p-8 bg-[#12171F]">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">// authenticate</div>
                <h1 className="font-display font-semibold text-4xl mt-2">Log in</h1>

                <form onSubmit={onSubmit} className="mt-8 space-y-4" data-testid="login-form">
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input mt-2" data-testid="login-email" />
                    </div>
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input mt-2" data-testid="login-password" />
                    </div>
                    {error && <div className="border border-[#FF5C57] bg-[#2A0F0F] text-[#FF5C57] p-3 text-sm font-mono" data-testid="login-error">{error}</div>}
                    <button type="submit" disabled={loading} className="btn btn-primary w-full !py-4" data-testid="login-submit">
                        {loading ? "Signing in…" : "Sign in →"}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-[#21262D] font-mono text-xs text-[#7D8590]">
                    No account? <Link to="/register" className="text-[#39FF6A] hover:underline" data-testid="link-to-register">Create one</Link>
                </div>
            </div>
        </div>
    );
}

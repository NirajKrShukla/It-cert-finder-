import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { FaTerminal } from "react-icons/fa6";

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
        setLoading(true); setError("");
        const res = await register(email, password, name);
        setLoading(false);
        if (res.ok) { toast.success("Account created"); nav("/dashboard"); }
        else setError(res.error);
    };

    return (
        <div className="max-w-md mx-auto px-6 py-16">
            <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-3xl">
                <span className="h-8 w-8 grid place-items-center bg-[#39FF6A] text-[#0A0E14]"><FaTerminal className="text-sm" /></span>
                cert<span className="text-[#39FF6A]">hub</span>
            </Link>

            <div className="border border-[#21262D] mt-10 p-8 bg-[#12171F]">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#39FF6A]">// new user</div>
                <h1 className="font-display font-semibold text-4xl mt-2">Create account</h1>

                <form onSubmit={onSubmit} className="mt-8 space-y-4" data-testid="register-form">
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">Full name</label>
                        <input required value={name} onChange={e => setName(e.target.value)} className="input mt-2" data-testid="register-name" />
                    </div>
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input mt-2" data-testid="register-email" />
                    </div>
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-[#7D8590]">Password (min 6)</label>
                        <input type="password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} className="input mt-2" data-testid="register-password" />
                    </div>
                    {error && <div className="border border-[#FF5C57] bg-[#2A0F0F] text-[#FF5C57] p-3 text-sm font-mono" data-testid="register-error">{error}</div>}
                    <button type="submit" disabled={loading} className="btn btn-primary w-full !py-4" data-testid="register-submit">
                        {loading ? "Creating…" : "Create account →"}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-[#21262D] font-mono text-xs text-[#7D8590]">
                    Already have one? <Link to="/login" className="text-[#39FF6A] hover:underline" data-testid="link-to-login">Log in</Link>
                </div>
            </div>
        </div>
    );
}

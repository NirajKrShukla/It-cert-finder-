import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FaTerminal } from "react-icons/fa6";

export default function Navbar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();

    return (
        <header className="sticky top-0 z-40 bg-[#0A0E14]/80 backdrop-blur-md border-b border-[#21262D]" data-testid="site-navbar">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
                <Link to="/" className="flex items-center gap-2.5 group" data-testid="brand-link">
                    <span className="h-8 w-8 grid place-items-center bg-[#39FF6A] text-[#0A0E14]">
                        <FaTerminal className="text-sm" />
                    </span>
                    <span className="font-display font-bold text-2xl tracking-tight">
                        cert<span className="text-[#39FF6A]">hub</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#7D8590] hidden lg:inline">/v2026</span>
                </Link>

                <nav className="hidden md:flex items-center gap-7 font-mono text-[11px] uppercase tracking-[0.16em] text-[#B1BAC4]">
                    <Link to="/" className="hover:text-[#39FF6A]" data-testid="nav-directory">Directory</Link>
                    <Link to="/?domain=cloud" className="hover:text-[#39FF6A]" data-testid="nav-cloud">Cloud</Link>
                    <Link to="/?domain=ai" className="hover:text-[#39FF6A]" data-testid="nav-ai">AI</Link>
                    <Link to="/?domain=security" className="hover:text-[#39FF6A]" data-testid="nav-security">Security</Link>
                    <Link to="/?domain=database" className="hover:text-[#39FF6A]" data-testid="nav-db">Databases</Link>
                    <Link to="/compare" className="hover:text-[#39FF6A]" data-testid="nav-compare">Compare</Link>
                </nav>

                <div className="flex items-center gap-3">
                    {user && user !== false ? (
                        <>
                            <Link to="/dashboard" className="btn btn-ghost hidden sm:inline-flex" data-testid="nav-dashboard-btn">Dashboard</Link>
                            <button onClick={async () => { await logout(); nav("/"); }} className="btn" data-testid="nav-logout-btn">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost" data-testid="nav-login-btn">Login</Link>
                            <Link to="/register" className="btn btn-primary" data-testid="nav-register-btn">Sign up</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

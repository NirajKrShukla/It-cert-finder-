import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FaBolt } from "react-icons/fa6";

export default function Navbar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-black" data-testid="site-navbar">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
                <Link to="/" className="flex items-center gap-2 group" data-testid="brand-link">
                    <span className="h-8 w-8 grid place-items-center bg-[#002FA7] text-white">
                        <FaBolt className="text-lg" />
                    </span>
                    <span className="font-display font-bold text-2xl tracking-tight">CERT<span className="text-[#002FA7]">HUB</span></span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest font-bold">
                    <Link to="/" className="hover:text-[#002FA7]" data-testid="nav-directory">Directory</Link>
                    <Link to="/?level=beginner" className="hover:text-[#002FA7]" data-testid="nav-beginner">Beginner</Link>
                    <Link to="/?domain=cloud" className="hover:text-[#002FA7]" data-testid="nav-cloud">Cloud</Link>
                    <Link to="/?domain=security" className="hover:text-[#002FA7]" data-testid="nav-security">Security</Link>
                </nav>

                <div className="flex items-center gap-3">
                    {user && user !== false ? (
                        <>
                            <Link to="/dashboard" className="hard-btn hard-btn-outline" data-testid="nav-dashboard-btn">
                                <span className="hidden sm:inline">Dashboard</span>
                                <span className="sm:hidden">Dash</span>
                            </Link>
                            <button onClick={async () => { await logout(); nav("/"); }} className="hard-btn" data-testid="nav-logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hard-btn hard-btn-outline" data-testid="nav-login-btn">Login</Link>
                            <Link to="/register" className="hard-btn hard-btn-blue" data-testid="nav-register-btn">Sign up</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

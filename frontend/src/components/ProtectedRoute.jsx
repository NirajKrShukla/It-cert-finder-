import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, ready } = useAuth();
    if (!ready) return (
        <div className="min-h-[60vh] grid place-items-center font-mono text-xs uppercase tracking-widest" data-testid="loading-auth">
            Loading…
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

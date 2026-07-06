import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // null = checking, false = anon
    const [ready, setReady] = useState(false);

    const refresh = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
        } catch (_e) {
            setUser(false);
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const login = async (email, password) => {
        try {
            const { data } = await api.post("/auth/login", { email, password });
            setUser(data);
            return { ok: true };
        } catch (e) {
            return { ok: false, error: formatApiErrorDetail(e.response?.data?.detail) || e.message };
        }
    };

    const register = async (email, password, name) => {
        try {
            const { data } = await api.post("/auth/register", { email, password, name });
            setUser(data);
            return { ok: true };
        } catch (e) {
            return { ok: false, error: formatApiErrorDetail(e.response?.data?.detail) || e.message };
        }
    };

    const logout = async () => {
        try { await api.post("/auth/logout"); } catch (_e) { /* ignore */ }
        setUser(false);
    };

    return (
        <AuthCtx.Provider value={{ user, ready, login, register, logout, refresh }}>
            {children}
        </AuthCtx.Provider>
    );
}

export const useAuth = () => useContext(AuthCtx);

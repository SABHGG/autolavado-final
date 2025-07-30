"use client"
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner"
import { API_URL } from "@/config/config";
import { User } from "@/types/types";

interface AuthContextProps {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    checkAuth: () => void;
    canAccess: (path: string) => boolean;
    getDefaultRouteForRole: (role: string) => string
    logOut: () => void
}

const USER_ALLOWED_ROUTES = ["/dashboard/appointments", "/dashboard/vehicles"];

const AuthContext = createContext<AuthContextProps>({
    user: null,
    loading: true,
    isAuthenticated: false,
    checkAuth: () => { },
    canAccess: () => false,
    getDefaultRouteForRole: () => "/",
    logOut: () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/users/me`, {
                method: "GET",
                credentials: "include", // Usa cookies HTTP-Only
                headers: {
                    'Cache-Control': 'no-store' // Evita caché del navegador
                }
            });

            if (!res.ok) {
                setUser(null);
                return;
            }

            const data = await res.json();
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const canAccess = (path: string | undefined): boolean => {
        if (!user || !path) return false;
        if (user.role === "admin") return true;
        if (user.role === "client") {
            return USER_ALLOWED_ROUTES.some((route) => path.startsWith(route));
        }
        return false;
    };

    const getDefaultRouteForRole = (role: string) => {
        if (role === "admin") return "/dashboard";
        if (role === "client") return USER_ALLOWED_ROUTES[0];
        return "/";
    };

    const logOut = async () => {
        const toastId = toast.loading("Cerrando sesión...");
        try {
            const res = await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            toast.dismiss(toastId);

            if (!res.ok) {
                toast.error("Error al cerrar sesión");
                return;
            }

            setUser(null);
            // Limpiar caché al cerrar sesión
            localStorage.removeItem('cachedUser');
            localStorage.removeItem('cachedUserTimestamp');
            toast.success("Sesión cerrada correctamente");
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Error de conexión al cerrar sesión");
            console.error("Logout error:", error);
        }
    }

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                checkAuth,
                canAccess,
                getDefaultRouteForRole,
                logOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
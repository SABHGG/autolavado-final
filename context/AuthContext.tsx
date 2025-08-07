"use client"
import { createContext, useContext, useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging"
import { messaging } from "@/lib/firebase"
import { toast } from "sonner";
import { getCsrfToken } from "@/lib/getcrfstoken"
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
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    useEffect(() => {
        setCsrfToken(getCsrfToken());
    }, []);
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

            if (data.role === "admin") {
                registerAdminToken();
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const registerAdminToken = async () => {
        try {

            if (fcmToken || localStorage.getItem("fcmToken")) return;

            if (!messaging) return;


            const permission = await Notification.requestPermission();

            if (permission !== "granted") return;

            await navigator.serviceWorker.register("/firebase-messaging-sw.js");

            const readyRegistration = await navigator.serviceWorker.ready;

            const token = await getToken(messaging, {
                vapidKey: "BNGRsy4sayjrkefvnpgf3jL5xv3XgX1zTbk28maT0L5fnEi_7Pdv8pkbWBma6Z7u66JyRENRPS1uxFwpDkhR0lk",
                serviceWorkerRegistration: readyRegistration
            });

            if (!token) return;

            setFcmToken(token);
            localStorage.setItem("fcmToken", token);

            const response = await fetch(`${API_URL}/fcm/register`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                credentials: "include",
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                console.error("❌ Error al registrar token en backend:", await response.text());
            } else {
                console.log("✅ Token registrado en backend correctamente.");
            }

            onMessage(messaging, (payload) => {
                new Notification(
                    payload.notification?.title || "Nueva notificación",
                    {
                        body: payload.notification?.body,
                        icon: "/icon.webp", // Ruta a tu ícono
                    }
                )
            });

            console.log("✅ Registro de token FCM finalizado con éxito.");
        } catch (err) {
            console.error("❌ Error en registro de token FCM:", err);
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
            localStorage.removeItem('fcmToken');
            setFcmToken(null);
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
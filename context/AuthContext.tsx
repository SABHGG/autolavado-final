"use client"
import { createContext, useContext, useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging"
import { messaging } from "@/lib/firebase"
import { toast } from "sonner";
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
            if (fcmToken || localStorage.getItem('fcmToken')) return;
            if (!messaging) return;
            const permission = await Notification.requestPermission();
            if (permission !== "granted") return;
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            try {
                const token = await getToken(messaging, {
                    vapidKey: "BFHUMXPUUsGNiVBTuuI7c-visEA7l3H1WDC1hviol8TAzfQgnakP86ndSwlzRtlWSZTFXAkXXAhhFxyT2d2q0Vo",
                    serviceWorkerRegistration: registration
                });

                if (token) {
                    setFcmToken(token);
                    localStorage.setItem('fcmToken', token);
                    try {
                        const response = await fetch(`${API_URL}/fcm/register`, {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: "include",
                            body: JSON.stringify({ token }),
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            console.error("Error al registrar token FCM:", errorData);
                        }

                    } catch (error) {
                        console.error("Error en la petición FCM:", error);
                    }
                } else {
                    console.warn("No se pudo obtener token (posible sin permisos)");
                }

            } catch (error) {
                console.error("Error al obtener token FCM:", error);
            }

            onMessage(messaging, (payload) => {
                toast(payload.notification?.title ?? "Notificación", {
                    description: payload.notification?.body,
                });
            });

        } catch (err) {
            console.error("Error al registrar token FCM:", err);
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
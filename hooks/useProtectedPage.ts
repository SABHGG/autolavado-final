"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useProtectedPage() {
  const { user, loading, isAuthenticated, canAccess, getDefaultRouteForRole } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    if (!loading && router) {
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${router}`);
        return;
      }

      if (!canAccess(pathname)) {
        const fallback = getDefaultRouteForRole(user?.role || "");
        router.replace(fallback);
      }
    }
  }, [
    loading,
    isAuthenticated,
    user,
    router,
    canAccess,
    getDefaultRouteForRole,
  ]);

  return { loading };
}

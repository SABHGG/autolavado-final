import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_URL } from "@/config/config";

// Rutas permitidas para usuarios normales (rol 'user')
const USER_ALLOWED_ROUTES = ["/dashboard/appointments", "/dashboard/vehicles"];

// Rutas protegidas que requieren autenticación
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/perfil"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta está protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Si no es una ruta protegida, permitir acceso
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // Verificar autenticación y obtener datos del usuario
    const res = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        cookie: request.cookies.toString(),
      },
    });

    if (!res.ok) {
      // Usuario no autenticado, redirige al login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userData = await res.json();
    const userRole = userData.role || "client"; // Asumir 'client' como rol por defecto

    // Verificar acceso basado en el rol
    if (userRole === "client") {
      // Para usuarios normales, verificar si la ruta está permitida
      const isAllowed = USER_ALLOWED_ROUTES.some((route) =>
        pathname.startsWith(route)
      );

      if (!isAllowed) {
        // Redirigir a la primera ruta permitida
        return NextResponse.redirect(
          new URL(USER_ALLOWED_ROUTES[0], request.url)
        );
      }
    }
    // Los roles 'admin' u otros tienen acceso completo

    return NextResponse.next();
  } catch (error) {
    console.error("Error en middleware:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/perfil/:path*"],
};

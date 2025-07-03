import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_URL } from "@/config/config";

const PROTECTED_ROUTES = ["/dashboard", "/admin", "/perfil"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo aplicar a rutas protegidas
  if (!PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar autenticación con tu backend Flask
  try {
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

    return NextResponse.next();
  } catch (error) {
    console.error("Error en middleware:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/perfil/:path*"], // rutas protegidas
};

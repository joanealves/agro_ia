import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // API sempre passa
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Home pública
  if (!token && pathname === "/") {
    return NextResponse.next();
  }

  // Logado na home → dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isPublicPage = publicPaths.includes(pathname);

  // Não logado tentando acessar rota protegida
  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logado tentando acessar login/register
  if (token && isPublicPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt).*)"],
};


// import { NextRequest, NextResponse } from 'next/server';

// // Páginas públicas que não requerem autenticação
// const publicPaths = ['/login', '/register', '/']; 

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('access_token')?.value;
//   const path = request.nextUrl.pathname;
  
//   // Verificar se a página atual é pública
//   const isPublicPage = publicPaths.some(publicPath => 
//     path === publicPath || path.startsWith(`${publicPath}/`)
//   );

//   // Se não tiver token e não for página pública, redirecionar para login
//   if (!token && !isPublicPage) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // Se tiver token e estiver tentando acessar login/register, redirecionar para dashboard
//   if (token && (path === '/login' || path === '/register')) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   return NextResponse.next();
// }

// // Configurar os caminhos que o middleware deve ser executado
// export const config = {
//   matcher: [
//     /*
//      * Corresponde a todos os caminhos, exceto:
//      * 1. /api (rotas de API)
//      * 2. /_next (arquivos Next.js)
//      * 3. /fonts (arquivos de fonte)
//      * 4. /icons (arquivos de ícones)
//      * 5. Arquivos estáticos como favicon.ico, manifest.json, robots.txt, etc.
//      */
//     '/((?!api|_next|fonts|icons|favicon.ico|manifest.json|robots.txt).*)',
//   ],
// };




// =============================================================================
// MIDDLEWARE - Proteção de rotas no servidor
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

// Rotas públicas que não requerem autenticação
const publicPaths = ["/login", "/register", "/"];

// Rotas de API que não devem ser interceptadas
const apiPaths = ["/api"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignora rotas de API
  if (apiPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;

  // Verifica se é página pública
  const isPublicPage = publicPaths.some(
    (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  );

  // Se não tiver token e não for página pública, redireciona para login
  if (!token && !isPublicPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se tiver token e estiver tentando acessar login/register, redireciona para dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se tiver token e acessar /, redireciona para dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configuração dos caminhos que o middleware deve interceptar
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos, exceto:
     * - _next (arquivos Next.js)
     * - static (arquivos estáticos)
     * - favicon.ico, manifest.json, robots.txt
     * - arquivos de imagem
     */
    "/((?!_next|static|favicon.ico|manifest.json|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
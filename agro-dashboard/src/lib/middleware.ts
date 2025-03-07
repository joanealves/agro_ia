import { NextRequest, NextResponse } from 'next/server';

// Páginas públicas que não requerem autenticação
const publicPaths = ['/login', '/register', '/']; 

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const path = request.nextUrl.pathname;
  
  // Verificar se a página atual é pública
  const isPublicPage = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );

  // Se não tiver token e não for página pública, redirecionar para login
  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se tiver token e estiver tentando acessar login/register, redirecionar para dashboard
  if (token && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configurar os caminhos que o middleware deve ser executado
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos, exceto:
     * 1. /api (rotas de API)
     * 2. /_next (arquivos Next.js)
     * 3. /fonts (arquivos de fonte)
     * 4. /icons (arquivos de ícones)
     * 5. Arquivos estáticos como favicon.ico, manifest.json, robots.txt, etc.
     */
    '/((?!api|_next|fonts|icons|favicon.ico|manifest.json|robots.txt).*)',
  ],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso público a APIs específicas
  const publicApis = [
    '/api/courses',
    '/api/blog', 
    '/api/candidates',
    '/api/cloudinary/upload',
    '/api/cloudinary/test',
    '/api/test',
    '/api/debug'
  ];

  // Verificar se é uma API pública
  const isPublicApi = publicApis.some(api => pathname.startsWith(api));
  
  if (isPublicApi) {
    // Adicionar headers CORS para APIs públicas
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  // Proteger rotas admin (apenas páginas, não APIs)
  if (pathname.startsWith('/admin') && pathname !== '/admin' && !pathname.startsWith('/api/')) {
    // Verificar se existe token de autenticação
    const userData = request.cookies.get('userData')?.value;
    
    if (!userData) {
      // Redirecionar para login se não há dados de utilizador
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    try {
      const user = JSON.parse(userData);
      
      // Verificar se o utilizador tem role ADMIN
      if (user.role !== 'ADMIN') {
        // Limpar cookie e redirecionar
        const response = NextResponse.redirect(new URL('/admin', request.url));
        response.cookies.delete('userData');
        return response;
      }
    } catch (error) {
      // Se há erro ao parsear, limpar cookie e redirecionar
      const response = NextResponse.redirect(new URL('/admin', request.url));
      response.cookies.delete('userData');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 
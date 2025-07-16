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
  // Nota: A autenticação é gerida pelo frontend, não pelo middleware
  // O middleware apenas adiciona headers CORS para APIs públicas

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 
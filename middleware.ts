import { NextResponse } from 'next/server';

export function middleware(request: any) {
  // Permitir acesso a todas as rotas admin
  // O layout admin irá verificar a autenticação e mostrar o LoginForm se necessário
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
}; 
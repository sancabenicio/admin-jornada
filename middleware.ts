import { NextResponse } from 'next/server';

export function middleware(request: any) {
  // Adicionar headers CORS para permitir requisições do frontend público
  const response = NextResponse.next();
  
  // Permitir requisições do frontend público
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Permitir acesso a todas as rotas admin
  // O layout admin irá verificar a autenticação e mostrar o LoginForm se necessário
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
}; 
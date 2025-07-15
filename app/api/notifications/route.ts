import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Função para adicionar headers CORS
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response = NextResponse.json(notifications);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    const response = NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type } = body;

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type
      }
    });

    const response = NextResponse.json(notification, { status: 201 });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    const response = NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// Adicionar suporte para OPTIONS (preflight requests)
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
} 
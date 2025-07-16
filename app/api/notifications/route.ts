import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
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

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
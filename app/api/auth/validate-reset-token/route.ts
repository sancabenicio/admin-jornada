import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const validateTokenSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = validateTokenSchema.parse(body);
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Token válido' 
    });

  } catch (error) {
    console.error('Erro ao validar token:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
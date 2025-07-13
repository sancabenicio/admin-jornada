import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'Palavra-passe deve ter pelo menos 6 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

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

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Palavra-passe alterada com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao resetar palavra-passe:', error);
    
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
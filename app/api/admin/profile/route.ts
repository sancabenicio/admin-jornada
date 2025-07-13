import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  avatar: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || undefined,
      phone: user.phone || undefined,
      department: user.department || undefined,
      joinedAt: user.createdAt,
      lastLogin: user.updatedAt
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        department: validatedData.department,
        avatar: validatedData.avatar
      }
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      department: updatedUser.department,
      joinedAt: updatedUser.createdAt,
      lastLogin: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, email, password, role, department } = await request.json();

    // Validações básicas
    if (!name || !email || !role || !department) {
      return NextResponse.json(
        { error: 'Nome, email, função e departamento são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o utilizador existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o email já existe (exceto para o utilizador atual)
    const emailExists = await prisma.user.findFirst({
      where: {
        email,
        id: { not: params.id },
      },
    });

    if (emailExists) {
      return NextResponse.json(
        { error: 'Este email já está registado' },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {
      name,
      email,
      role,
      department,
    };

    // Se uma nova password foi fornecida, fazer hash
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Atualizar utilizador
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o utilizador existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Eliminar utilizador
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Utilizador eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar utilizador:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
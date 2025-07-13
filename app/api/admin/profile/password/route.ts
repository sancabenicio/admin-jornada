import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const passwordSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres')
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = passwordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: newHash }
    });

    return NextResponse.json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 
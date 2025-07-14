import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Atualizar template por id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, subject, content, type } = await req.json();
    
    if (!name || !subject || !content || !type) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
    }
    
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: { name, subject, content, type },
    });
    
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar template.' }, { status: 500 });
  }
}

// DELETE: Remover template por id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.emailTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover template.' }, { status: 500 });
  }
} 
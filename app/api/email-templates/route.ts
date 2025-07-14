import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Listar todos os templates
export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany();
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar templates.' }, { status: 500 });
  }
}

// POST: Criar novo template
export async function POST(req: NextRequest) {
  try {
    const { name, subject, content, type } = await req.json();
    if (!name || !subject || !content || !type) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
    }
    const template = await prisma.emailTemplate.create({
      data: { name, subject, content, type },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar template.' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const candidateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  country: z.string().min(1, 'País é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  age: z.number().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  notes: z.string().optional(),
  courseId: z.string().min(1, 'Curso é obrigatório'),
  status: z.enum(['REGISTERED', 'ACCEPTED', 'IN_TRAINING', 'COMPLETED', 'REJECTED']).optional(),
  submittedDocument: z.string().optional(),
  certificates: z.array(z.string()).optional(),
  passport: z.string().optional(),
  attachments: z.array(z.string()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (courseId && courseId !== 'all') {
      where.courseId = courseId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { course: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = candidateSchema.parse(body);

    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    const candidate = await prisma.candidate.create({
      data: {
        ...validatedData,
        status: validatedData.status || 'REGISTERED'
      },
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar candidato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
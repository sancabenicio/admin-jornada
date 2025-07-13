import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const courseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  duration: z.string().min(1, 'Duração é obrigatória'),
  startDate: z.string().datetime('Data de início inválida'),
  endDate: z.string().datetime('Data de fim inválida'),
  maxStudents: z.number().min(1, 'Número máximo de estudantes deve ser pelo menos 1'),
  applicationLimit: z.number().min(1, 'Limite de candidaturas deve ser pelo menos 1'),
  price: z.number().min(0, 'Preço deve ser pelo menos 0'),
  location: z.string().min(1, 'Localização é obrigatória'),
  image: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED', 'COMPLETED']).optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        _count: {
          select: {
            candidates: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar os dados para incluir contadores
    const coursesWithCounts = courses.map((course: any) => ({
      ...course,
      candidatesCount: course._count.candidates,
      acceptedCount: 0 // Será calculado separadamente se necessário
    }));

    return NextResponse.json(coursesWithCounts);
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = courseSchema.parse(body);

    const course = await prisma.course.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        status: validatedData.status || 'OPEN'
      },
      include: {
        _count: {
          select: {
            candidates: true
          }
        }
      }
    });

    const courseWithCounts = {
      ...course,
      candidatesCount: course._count.candidates,
      acceptedCount: 0
    };

    return NextResponse.json(courseWithCounts, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar curso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
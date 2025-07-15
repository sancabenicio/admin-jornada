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

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

let cachedCourses: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000;

export async function GET(request: NextRequest) {
  const now = Date.now();
  if (cachedCourses && now - cacheTimestamp < CACHE_DURATION) {
    return addCorsHeaders(NextResponse.json(cachedCourses));
  }
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    const coursesWithCounts = courses.map((course: any) => ({
      ...course,
      candidatesCount: 0,
      acceptedCount: 0
    }));

    // Atualiza o cache
    cachedCourses = coursesWithCounts;
    cacheTimestamp = now;

    const response = NextResponse.json(coursesWithCounts);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    const response = NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
    return addCorsHeaders(response);
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

    const response = NextResponse.json(courseWithCounts, { status: 201 });
    return addCorsHeaders(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    console.error('Erro ao criar curso:', error);
    const response = NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
} 
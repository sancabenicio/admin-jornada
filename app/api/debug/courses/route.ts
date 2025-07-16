import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Iniciando busca de cursos');
    
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    console.log('Debug: Parâmetros recebidos:', { status, search });

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

    console.log('Debug: Query where:', where);

    const courses = await prisma.course.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            candidates: true
          }
        }
      }
    });

    console.log('Debug: Cursos encontrados:', courses.length);

    const coursesWithCounts = courses.map((course: any) => ({
      ...course,
      candidatesCount: course._count.candidates,
      acceptedCount: 0
    }));

    console.log('Debug: Cursos processados:', coursesWithCounts.length);

    return NextResponse.json({
      success: true,
      count: coursesWithCounts.length,
      courses: coursesWithCounts,
      debug: {
        timestamp: new Date().toISOString(),
        query: where,
        rawCount: courses.length
      }
    });
  } catch (error) {
    console.error('Debug: Erro ao buscar cursos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
} 
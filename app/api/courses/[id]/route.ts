import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCourseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  duration: z.string().min(1, 'Duração é obrigatória').optional(),
  startDate: z.string().datetime('Data de início inválida').optional(),
  endDate: z.string().datetime('Data de fim inválida').optional(),
  maxStudents: z.number().min(1, 'Número máximo de estudantes deve ser pelo menos 1').optional(),
  applicationLimit: z.number().min(1, 'Limite de candidaturas deve ser pelo menos 1').optional(),
  price: z.number().min(0, 'Preço deve ser pelo menos 0').optional(),
  location: z.string().min(1, 'Localização é obrigatória').optional(),
  image: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED', 'COMPLETED']).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            candidates: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    const courseWithCounts = {
      ...course,
      candidatesCount: course._count.candidates,
      acceptedCount: 0
    };

    return NextResponse.json(courseWithCounts);
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    // Verificar se o curso existe
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = { ...validatedData };
    
    // Converter datas se fornecidas
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    }

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            candidates: true
          }
        }
      }
    });

    const courseWithCounts = {
      ...updatedCourse,
      candidatesCount: updatedCourse._count.candidates,
      acceptedCount: 0
    };

    return NextResponse.json(courseWithCounts);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar curso:', error);
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
    // Verificar se o curso existe
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se há candidatos associados
    const candidatesCount = await prisma.candidate.count({
      where: { courseId: params.id }
    });

    if (candidatesCount > 0) {
      return NextResponse.json(
        { error: 'Não é possível eliminar um curso que tem candidatos associados' },
        { status: 400 }
      );
    }

    await prisma.course.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Curso eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar curso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
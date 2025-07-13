import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCandidateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  country: z.string().min(1, 'País é obrigatório').optional(),
  phone: z.string().min(1, 'Telefone é obrigatório').optional(),
  age: z.number().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  notes: z.string().optional(),
  courseId: z.string().min(1, 'Curso é obrigatório').optional(),
  status: z.enum(['REGISTERED', 'ACCEPTED', 'IN_TRAINING', 'COMPLETED', 'REJECTED']).optional(),
  submittedDocument: z.string().optional(),
  certificates: z.array(z.string()).optional(),
  passport: z.string().optional(),
  attachments: z.array(z.string()).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Erro ao buscar candidato:', error);
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
    const validatedData = updateCandidateSchema.parse(body);

    // Verificar se o candidato existe
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: params.id }
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      );
    }

    // Se estiver a atualizar o curso, verificar se existe
    if (validatedData.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: validatedData.courseId }
      });

      if (!course) {
        return NextResponse.json(
          { error: 'Curso não encontrado' },
          { status: 404 }
        );
      }
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(updatedCandidate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar candidato:', error);
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
    // Verificar se o candidato existe
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: params.id }
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      );
    }

    await prisma.candidate.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Candidato eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar candidato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        attachments: true
      }
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      );
    }

    if (!candidate.attachments || candidate.attachments.length === 0) {
      return NextResponse.json(
        { error: 'Candidato não tem documentos' },
        { status: 404 }
      );
    }

    // Retornar informações dos documentos
    const documents = candidate.attachments.map((url, index) => {
      const fileName = url.split('/').pop() || `documento_${index + 1}`;
      return {
        url,
        fileName: `${candidate.name}_${fileName}`,
        originalName: fileName,
        index
      };
    });

    return NextResponse.json({
      candidateName: candidate.name,
      documents
    });

  } catch (error) {
    console.error('Erro ao buscar documentos do candidato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
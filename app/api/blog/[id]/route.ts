import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateBlogPostSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório').optional(),
  excerpt: z.string().min(1, 'Resumo é obrigatório').optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  author: z.string().min(1, 'Autor é obrigatório').optional(),
  readTime: z.number().min(1, 'Tempo de leitura deve ser pelo menos 1 minuto').optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Erro ao buscar post:', error);
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
    const validatedData = updateBlogPostSchema.parse(body);

    // Verificar se o post existe
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: params.id }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = { ...validatedData };
    
    // Se o status mudou para PUBLISHED e não tinha publishedAt, definir agora
    if (validatedData.status === 'PUBLISHED' && !existingPost.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar post:', error);
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
    // Verificar se o post existe
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: params.id }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    await prisma.blogPost.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Post eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar post:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
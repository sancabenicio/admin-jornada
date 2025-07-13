import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const blogPostSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  excerpt: z.string().min(1, 'Resumo é obrigatório'),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  author: z.string().min(1, 'Autor é obrigatório'),
  readTime: z.number().min(1, 'Tempo de leitura deve ser pelo menos 1 minuto')
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = blogPostSchema.parse(body);

    const post = await prisma.blogPost.create({
      data: {
        ...validatedData,
        status: validatedData.status || 'DRAFT',
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar post:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
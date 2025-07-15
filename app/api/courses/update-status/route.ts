import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST() {
  try {
    const now = new Date();
    
    const coursesToClose = await prisma.course.findMany({
      where: {
        status: 'OPEN',
        endDate: {
          lt: now
        }
      }
    });

    if (coursesToClose.length > 0) {
      await prisma.course.updateMany({
        where: {
          id: {
            in: coursesToClose.map(course => course.id)
          }
        },
        data: {
          status: 'CLOSED'
        }
      });

      console.log(`Atualizados ${coursesToClose.length} cursos para status CLOSED`);
    }

    const response = NextResponse.json({ 
      success: true, 
      updatedCount: coursesToClose.length,
      message: `Atualizados ${coursesToClose.length} cursos para status CLOSED`
    });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Erro ao atualizar status dos cursos:', error);
    const response = NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
} 
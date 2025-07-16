import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json({ 
      success: true, 
      updatedCount: coursesToClose.length,
      message: `Atualizados ${coursesToClose.length} cursos para status CLOSED`
    });
  } catch (error) {
    console.error('Erro ao atualizar status dos cursos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
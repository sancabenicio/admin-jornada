import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBulkEmail, sendEmail } from '@/lib/services/email.service';
import { z } from 'zod';
import { replaceVariables } from '@/lib/services/email.service';

const sendEmailSchema = z.object({
  subject: z.string().min(1, 'Assunto é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  recipients: z.enum(['all', 'course', 'status', 'custom']),
  courseId: z.string().optional(),
  status: z.string().optional(),
  customRecipients: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = sendEmailSchema.parse(body);

    // Buscar candidatos baseado nos filtros
    let where: any = {};

    switch (validatedData.recipients) {
      case 'course':
        if (!validatedData.courseId) {
          return NextResponse.json(
            { error: 'ID do curso é obrigatório quando selecionar por curso' },
            { status: 400 }
          );
        }
        where.courseId = validatedData.courseId;
        break;
      case 'status':
        if (!validatedData.status) {
          return NextResponse.json(
            { error: 'Status é obrigatório quando selecionar por status' },
            { status: 400 }
          );
        }
        where.status = validatedData.status;
        break;
      case 'custom':
        if (!validatedData.customRecipients || validatedData.customRecipients.length === 0) {
          return NextResponse.json(
            { error: 'Seleção de destinatários é obrigatória' },
            { status: 400 }
          );
        }
        where.id = { in: validatedData.customRecipients };
        break;
      // 'all' não precisa de filtro
    }

    // Buscar candidatos
    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum candidato encontrado com os filtros especificados' },
        { status: 404 }
      );
    }

    // Buscar todos os cursos para personalização
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true
      }
    });

    // Se for apenas um destinatário, envie individualmente
    if (candidates.length === 1) {
      const candidate = candidates[0];
      const course = candidate.course
        ? { id: candidate.course.id, name: candidate.course.name }
        : undefined;
      const personalizedSubject = replaceVariables(validatedData.subject, candidate, course);
      const personalizedContent = replaceVariables(validatedData.content, candidate, course);

      const success = await sendEmail({
        to: candidate.email,
        subject: personalizedSubject,
        content: personalizedContent,
        html: undefined
      });
      return NextResponse.json({
        message: success ? 'Email enviado com sucesso' : 'Falha ao enviar email',
        results: {
          total: 1,
          success: success ? 1 : 0,
          failed: success ? 0 : 1,
          errors: success ? [] : ['Falha ao enviar email']
        }
      });
    }

    // Enviar emails em massa
    const results = await sendBulkEmail(
      candidates,
      validatedData.subject,
      validatedData.content,
      courses
    );

    // Registrar o envio na base de dados (opcional)
    await prisma.notification.create({
      data: {
        title: 'Emails Enviados',
        message: `Enviados ${results.success} emails com sucesso. ${results.failed} falharam.`,
        type: 'INFO'
      }
    });

    return NextResponse.json({
      message: 'Emails enviados com sucesso',
      results: {
        total: candidates.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao enviar emails:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Email não encontrado. Verifique se o email está correto.' 
      }, { status: 404 });
    }

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const { data, error } = await resend.emails.send({
      from: 'Jornada Porto <noreply@jornarda-porto.pt>',
      to: [email],
      subject: 'Recuperação de Palavra-passe - Coração da Jornada',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 30px; text-align: center;">Coração da Jornada</h1>
          
          <h2 style="color: #333; margin-bottom: 20px;">Recuperação de Palavra-passe</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Olá ${user.name},
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Recebemos uma solicitação para redefinir a sua palavra-passe. Se não foi você quem fez esta solicitação, pode ignorar este email.
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Para redefinir a sua palavra-passe, clique no link abaixo:
          </p>
          
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" style="color: #007bff; text-decoration: underline;">
              ${resetUrl}
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
            <strong>Importante:</strong> Este link expira em 1 hora por motivos de segurança.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center;">
            Este é um email automático, não responda a esta mensagem.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      return NextResponse.json(
        { error: 'Erro ao enviar email de recuperação' },
        { status: 500 }
      );
    }

    console.log('Email de recuperação enviado:', data);

    return NextResponse.json({ 
      success: true, 
      message: 'Se o email existir, receberá um link de recuperação.' 
    });

  } catch (error) {
    console.error('Erro ao processar recuperação de palavra-passe:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
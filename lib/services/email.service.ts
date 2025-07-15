import { Resend } from 'resend';
import { Candidate, Course } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);
export const replaceVariables = (template: string, candidate: Candidate, course?: { id: string; name: string }) => {
  return template
    .replace(/{nome}/g, candidate.name)
    .replace(/{email}/g, candidate.email)
    .replace(/{curso}/g, course?.name || 'N/A')
    .replace(/{estado}/g, candidate.status)
    .replace(/{pais}/g, candidate.country)
    .replace(/{telefone}/g, candidate.phone);
};

// Função para adicionar aviso de não responder automaticamente
export const addNoReplyWarning = (content: string): string => {
  const warning = `

---
IMPORTANTE: Este é um email automático. Por favor, não responda a esta mensagem.
Para qualquer questão adicional, utilize o email: cfp@jornada-porto.pt`;

  // Verificar se já tem o aviso para não duplicar
  if (content.includes('IMPORTANTE: Este é um email automático')) {
    return content;
  }

  return content + warning;
};

// Função para criar template HTML com aviso
export const createEmailHTML = (content: string): string => {
  const contentWithWarning = addNoReplyWarning(content);
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
      ${contentWithWarning.replace(/\n/g, '<br>')}
    </div>
  `;
};

// Interface para dados do email
export interface EmailData {
  to: string;
  subject: string;
  content: string;
  html?: string;
}

function getFriendlyErrorMessage(error: any): string {
  if (!error) return 'Erro desconhecido ao enviar email.';
  if (typeof error === 'string') return error;
  if (error.message?.includes('domain is not verified')) {
    return 'O serviço de email ainda não está disponível. Por favor, tente novamente mais tarde ou contacte o suporte.';
  }
  if (error.message?.includes('Invalid API key')) {
    return 'Erro de configuração do serviço de email. Contacte o suporte.';
  }
  return 'Não foi possível enviar o email. Por favor, tente novamente mais tarde.';
}

// Função para enviar email individual
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Adicionar aviso de não responder automaticamente
    const contentWithWarning = addNoReplyWarning(emailData.content);
    const htmlWithWarning = emailData.html ? addNoReplyWarning(emailData.html) : createEmailHTML(emailData.content);

    const { data, error } = await resend.emails.send({
      from: 'noreply@jornada-porto.pt',
      to: [emailData.to],
      subject: emailData.subject,
      text: contentWithWarning,
      html: htmlWithWarning,
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error(getFriendlyErrorMessage(error));
    }

    console.log('Email enviado com sucesso:', data);
    return true;
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    throw new Error(getFriendlyErrorMessage(error));
  }
};

// Função para enviar email em massa
export const sendBulkEmail = async (
  recipients: Candidate[],
  subject: string,
  content: string,
  courses: { id: string; name: string }[]
): Promise<{ success: number; failed: number; errors: string[] }> => {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const candidate of recipients) {
    try {
      const course = courses.find(c => c.id === candidate.courseId);
      const personalizedSubject = replaceVariables(subject, candidate, course);
      const personalizedContent = replaceVariables(content, candidate, course);
      
      // Adicionar aviso de não responder automaticamente
      const contentWithWarning = addNoReplyWarning(personalizedContent);

      const { data, error } = await resend.emails.send({
        from: 'noreply@jornada-porto.pt',
        to: [candidate.email],
        subject: personalizedSubject,
        text: contentWithWarning,
        html: createEmailHTML(personalizedContent),
      });

      if (error) {
        results.failed++;
        const friendly = getFriendlyErrorMessage(error);
        results.errors.push(`Erro ao enviar para ${candidate.email}: ${friendly}`);
        console.error(`Erro ao enviar email para ${candidate.email}:`, error);
      } else {
        results.success++;
        console.log(`Email enviado com sucesso para ${candidate.email}:`, data);
      }
    } catch (error: any) {
      results.failed++;
      const friendly = getFriendlyErrorMessage(error);
      results.errors.push(`Erro ao enviar para ${candidate.email}: ${friendly}`);
      console.error(`Erro ao enviar email para ${candidate.email}:`, error);
    }
  }

  return results;
};

// Função para testar conexão com Resend
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    // Enviar um email de teste para verificar a conexão
    const testContent = 'Este é um email de teste para verificar a conexão com o Resend.';
    const { data, error } = await resend.emails.send({
      from: 'noreply@jornada-porto.pt',
      to: ['beniciosanca224@gmail.com'],
      subject: 'Teste de Conexão',
      text: addNoReplyWarning(testContent),
      html: createEmailHTML(testContent),
    });

    if (error) {
      console.error('Erro na conexão com Resend:', error);
      return false;
    }

    console.log('Conexão com Resend testada com sucesso:', data);
    return true;
  } catch (error) {
    console.error('Erro na conexão com Resend:', error);
    return false;
  }
}; 
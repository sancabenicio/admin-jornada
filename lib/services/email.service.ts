import nodemailer from 'nodemailer';
import { Candidate, Course } from '@prisma/client';

// Configuração do transporter de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Função para substituir variáveis no template
const replaceVariables = (template: string, candidate: Candidate, course?: { id: string; name: string }) => {
  return template
    .replace(/{nome}/g, candidate.name)
    .replace(/{email}/g, candidate.email)
    .replace(/{curso}/g, course?.name || 'N/A')
    .replace(/{estado}/g, candidate.status)
    .replace(/{pais}/g, candidate.country)
    .replace(/{telefone}/g, candidate.phone);
};

// Interface para dados do email
export interface EmailData {
  to: string;
  subject: string;
  content: string;
  html?: string;
}

// Função para enviar email individual
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.content,
      html: emailData.html || emailData.content.replace(/\n/g, '<br>'),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
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

  const transporter = createTransporter();

  for (const candidate of recipients) {
    try {
      const course = courses.find(c => c.id === candidate.courseId);
      const personalizedSubject = replaceVariables(subject, candidate, course);
      const personalizedContent = replaceVariables(content, candidate, course);

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: candidate.email,
        subject: personalizedSubject,
        text: personalizedContent,
        html: personalizedContent.replace(/\n/g, '<br>'),
      };

      await transporter.sendMail(mailOptions);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Erro ao enviar para ${candidate.email}: ${error}`);
      console.error(`Erro ao enviar email para ${candidate.email}:`, error);
    }
  }

  return results;
};

// Função para testar conexão SMTP
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Erro na conexão SMTP:', error);
    return false;
  }
}; 
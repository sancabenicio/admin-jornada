import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail } from '@/lib/services/email.service';
import crypto from 'crypto';

// Função para upload direto para Cloudinary (lado servidor)
async function uploadToCloudinaryServer(file: File, resourceType: 'image' | 'raw' = 'raw'): Promise<string> {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL não configurada');
  }

  // Extrair credenciais do CLOUDINARY_URL
  const match = cloudinaryUrl.match(/^cloudinary:\/\/(.+):(.+)@(.+)$/);
  if (!match) {
    throw new Error('CLOUDINARY_URL inválida');
  }
  const [_, apiKey, apiSecret, cloudName] = match;

  // Preparar upload para Cloudinary
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  // Converter File para base64
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${file.type};base64,${base64}`;

  // Criar timestamp e assinatura para upload assinado
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp: timestamp,
    folder: 'coracao-jornada'
  };

  // Criar assinatura
  const signature = crypto
    .createHash('sha1')
    .update(`folder=coracao-jornada&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  // Enviar para Cloudinary com upload assinado
  const form = new FormData();
  form.append('file', dataUrl);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp.toString());
  form.append('signature', signature);
  form.append('folder', 'coracao-jornada');

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: form
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao enviar para Cloudinary: ${error}`);
  }

  const data = await response.json();
  return data.secure_url;
}

const candidateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  country: z.string().min(1, 'País é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  age: z.number().min(16, 'Idade deve ser pelo menos 16 anos').max(100, 'Idade deve ser no máximo 100 anos'),
  education: z.string().min(1, 'Nível de escolaridade é obrigatório'),
  experience: z.string().min(1, 'Experiência profissional é obrigatória'),
  notes: z.string().min(1, 'Motivação é obrigatória'),
  courseId: z.string().min(1, 'Curso é obrigatório'),
  status: z.enum(['REGISTERED', 'ACCEPTED', 'IN_TRAINING', 'COMPLETED', 'REJECTED']).optional(),
  submittedDocument: z.string().optional(),
  certificates: z.array(z.string()).optional(),
  passport: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  documentNames: z.array(z.string()).optional()
});

// Cache eficiente para candidatos
let candidatesCache: any = null;
let candidatesCacheTimestamp = 0;
const CANDIDATES_CACHE_DURATION = 30 * 1000; // 30 segundos

// Função para invalidar cache de candidatos
export function invalidateCandidatesCache() {
  candidatesCache = null;
  candidatesCacheTimestamp = 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search');
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Verificar se podemos usar o cache
    const now = Date.now();
    const canUseCache = !forceRefresh && 
                       candidatesCache && 
                       (now - candidatesCacheTimestamp < CANDIDATES_CACHE_DURATION) &&
                       !status && 
                       !courseId && 
                       !search;

    if (canUseCache) {
      return NextResponse.json(candidatesCache);
    }

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (courseId && courseId !== 'all') {
      where.courseId = courseId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { course: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });

    // Atualizar cache apenas se não houver filtros
    if (!status && !courseId && !search) {
      candidatesCache = candidates;
      candidatesCacheTimestamp = now;
    }

    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let validatedData: any;
    let attachments: string[] = [];

    // Verificar se é FormData ou JSON
    const contentType = request.headers.get('content-type');
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Processar FormData
      const formData = await request.formData();
      
      // Extrair dados básicos
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;
      const country = formData.get('country') as string;
      const courseId = formData.get('courseId') as string;
      const age = formData.get('age') as string;
      const education = formData.get('education') as string;
      const experience = formData.get('experience') as string;
      const notes = formData.get('notes') as string;
      
      // Extrair tipos de documentos
      const documentTypes: string[] = [];
      for (let i = 0; formData.get(`documentTypes[${i}]`); i++) {
        documentTypes.push(formData.get(`documentTypes[${i}]`) as string);
      }
      
      // Upload de documentos para Cloudinary
      const files = formData.getAll('documents') as File[];
      const documentNames: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(file => uploadToCloudinaryServer(file));
        attachments = await Promise.all(uploadPromises);
        // Guardar os nomes originais dos arquivos
        documentNames.push(...files.map(file => file.name));
      }
      
      // Validação dos campos obrigatórios
      if (!name || !email || !phone || !country || !courseId || !age || !education || !experience || !notes) {
        return NextResponse.json(
          { error: 'Todos os campos são obrigatórios' },
          { status: 400 }
        );
      }

      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
        return NextResponse.json(
          { error: 'Idade deve estar entre 16 e 100 anos' },
          { status: 400 }
        );
      }

      validatedData = {
        name,
        email,
        phone,
        country,
        courseId,
        age: ageNum,
        education,
        experience,
        notes,
        status: 'REGISTERED',
        attachments,
        documentNames
      };
    } else {
      // Processar JSON (compatibilidade com admin)
      const body = await request.json();
      validatedData = candidateSchema.parse(body);
    }

    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId }
    });

    if (!course) {
      const response = NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
      return NextResponse.json(response);
    }

    const candidate = await prisma.candidate.create({
      data: {
        ...validatedData,
        status: validatedData.status || 'REGISTERED'
      },
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Enviar email de confirmação para o candidato
    try {
      const emailSubject = 'Candidatura Recebida - Coração da Jornada';
      const emailContent = `
Olá ${candidate.name},

Obrigado pela sua candidatura ao curso "${candidate.course.name}"!

A sua candidatura foi recebida com sucesso e está a ser analisada pela nossa equipa.

Detalhes da sua candidatura:
- Nome: ${candidate.name}
- Email: ${candidate.email}
- Curso: ${candidate.course.name}
- Data de candidatura: ${new Date(candidate.appliedAt).toLocaleDateString('pt-PT')}

Entraremos em contacto em breve através do email fornecido para informar sobre o próximo passo.

Se tiver alguma questão, não hesite em contactar-nos através do email: cfp@jornada-porto.pt

Atenciosamente,
Equipa Coração da Jornada
      `;

      await sendEmail({
        to: candidate.email,
        subject: emailSubject,
        content: emailContent
      });

      console.log(`Email de confirmação enviado para ${candidate.email}`);
    } catch (emailError) {
      console.error('Erro ao enviar email de confirmação:', emailError);
    }

    try {
      await prisma.notification.create({
        data: {
          title: 'Nova Candidatura',
          message: `Nova candidatura recebida de ${candidate.name} para o curso ${candidate.course.name}`,
          type: 'INFO'
        }
      });
    } catch (notificationError) {
      console.error('Erro ao criar notificação:', notificationError);
    }

          // Invalidar cache após criar candidato
      invalidateCandidatesCache();

      return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
              return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        );
    }

    console.error('Erro ao criar candidato:', error);
          return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
  }
}

// Adicionar suporte para OPTIONS (preflight requests)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
} 
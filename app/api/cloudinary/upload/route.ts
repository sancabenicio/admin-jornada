import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const resourceType = formData.get('resourceType') as string || 'image';
    
    if (!file) {
      return NextResponse.json({ error: 'Ficheiro não enviado' }, { status: 400 });
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      return NextResponse.json({ error: 'CLOUDINARY_URL não configurada' }, { status: 500 });
    }

    // Extrair credenciais do CLOUDINARY_URL
    const match = cloudinaryUrl.match(/^cloudinary:\/\/(.+):(.+)@(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'CLOUDINARY_URL inválida' }, { status: 500 });
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

    console.log('Enviando para Cloudinary:', {
      cloudName,
      resourceType,
      fileSize: file.size,
      fileType: file.type,
      timestamp,
      signature: signature.substring(0, 10) + '...'
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: form
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro Cloudinary:', error);
      return NextResponse.json({ error: 'Erro ao enviar para Cloudinary', details: error }, { status: 500 });
    }

    const data = await response.json();
    console.log('Upload bem-sucedido:', data.secure_url);
    return NextResponse.json({ secure_url: data.secure_url });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno', details: String(error) }, { status: 500 });
  }
} 
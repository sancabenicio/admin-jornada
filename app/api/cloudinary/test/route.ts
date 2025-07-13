import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  
  if (!cloudinaryUrl) {
    return NextResponse.json({ 
      error: 'CLOUDINARY_URL não configurada',
      env: process.env.NODE_ENV 
    }, { status: 500 });
  }

  // Extrair credenciais do CLOUDINARY_URL
  const match = cloudinaryUrl.match(/^cloudinary:\/\/(.+):(.+)@(.+)$/);
  if (!match) {
    return NextResponse.json({ 
      error: 'CLOUDINARY_URL inválida',
      url: cloudinaryUrl.substring(0, 20) + '...' 
    }, { status: 500 });
  }

  const [_, apiKey, apiSecret, cloudName] = match;

  return NextResponse.json({ 
    status: 'Configuração OK',
    cloudName,
    apiKeyLength: apiKey.length,
    apiSecretLength: apiSecret.length
  });
} 
import { NextRequest, NextResponse } from 'next/server';
import { testEmailConnection } from '@/lib/services/email.service';

export async function POST(request: NextRequest) {
  try {
    const isConnected = await testEmailConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Conexão SMTP estabelecida com sucesso'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Falha na conexão SMTP'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao testar conexão SMTP:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao testar conexão SMTP'
    }, { status: 500 });
  }
} 
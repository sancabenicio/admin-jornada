import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'API está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
} 
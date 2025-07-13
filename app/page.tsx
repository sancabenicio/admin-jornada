'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center px-4 max-w-2xl">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-jornada.png"
            alt="Coração da Jornada"
            width={100}
            height={100}
            className="h-24 w-auto"
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Coração da Jornada
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Sistema de gestão para o seu centro de formação
        </p>
        
        <Button 
          size="lg" 
          className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push('/admin')}
        >
          Aceder ao Painel
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
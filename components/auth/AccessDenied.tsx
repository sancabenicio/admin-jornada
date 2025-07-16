'use client';

import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
  message?: string;
  showBackButton?: boolean;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  message = 'Acesso negado. Apenas administradores podem aceder a esta página.',
  showBackButton = true 
}) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">Acesso Negado</CardTitle>
          <CardDescription className="text-slate-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <AlertTriangle className="h-4 w-4" />
            <span>Permissões insuficientes</span>
          </div>
          
          {showBackButton && (
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/admin')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Voltar ao Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="w-full"
              >
                Voltar à Página Anterior
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 
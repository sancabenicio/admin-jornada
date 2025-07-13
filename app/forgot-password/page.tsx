'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Erro ao enviar email de recuperação.');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo-jornada.png"
                alt="Coração da Jornada"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </div>
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Email Enviado!</CardTitle>
            <CardDescription>
              Enviámos um link de recuperação para o seu email.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              Verifique a sua caixa de entrada e siga as instruções para redefinir a sua palavra-passe.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-jornada.png"
              alt="Coração da Jornada"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Recuperar Palavra-passe</CardTitle>
          <CardDescription>
            Digite o seu email para receber um link de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite o seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={error ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'A enviar...' : 'Enviar Link de Recuperação'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Link href="/">
              <Button 
                variant="link" 
                className="text-sm text-gray-600 hover:text-gray-800 p-0 h-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar ao Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
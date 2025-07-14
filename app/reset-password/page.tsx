'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token de recuperação inválido.');
        setIsCheckingToken(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setIsValidToken(true);
        } else {
          setError('Token de recuperação inválido ou expirado.');
        }
      } catch (error) {
        setError('Erro ao validar token.');
      } finally {
        setIsCheckingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Erro ao redefinir palavra-passe.');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">A validar token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="text-2xl font-bold">Palavra-passe Alterada!</CardTitle>
            <CardDescription>
              A sua palavra-passe foi redefinida com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              Pode agora fazer login com a sua nova palavra-passe.
            </p>
            <Link href="/">
              <Button className="w-full">
                Ir para o Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
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
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Token Inválido</CardTitle>
            <CardDescription>
              O link de recuperação é inválido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              Solicite um novo link de recuperação.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full">
                Solicitar Novo Link
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
          <CardTitle className="text-2xl font-bold">Nova Palavra-passe</CardTitle>
          <CardDescription>
            Digite a sua nova palavra-passe
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
              <Label htmlFor="password">Nova Palavra-passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a nova palavra-passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={error ? 'border-red-300 focus:border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme a nova palavra-passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={error ? 'border-red-300 focus:border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'A alterar...' : 'Alterar Palavra-passe'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar ao Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
} 
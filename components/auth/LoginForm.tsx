'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setIsAuthenticated } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Clear previous errors
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Verificar se o utilizador tem role ADMIN
        if (data.user.role !== 'ADMIN') {
          setError('Acesso negado. Apenas administradores podem aceder ao painel.');
          return;
        }
        
        // Store user data in localStorage and cookie
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Definir cookie para o middleware
        document.cookie = `userData=${JSON.stringify(data.user)}; path=/; max-age=86400; SameSite=Strict`;
        
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Credenciais inválidas. Verifique o email e palavra-passe.');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold">Painel Administrativo</CardTitle>
          <CardDescription>Faça login para aceder ao sistema</CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a sua palavra-passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={error ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'A entrar...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Link href="/forgot-password">
              <Button 
                variant="link" 
                className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
              >
                Esqueceu a palavra-passe?
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
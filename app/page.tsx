'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Mail, FileText, BarChart3, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: BookOpen,
      title: 'Gestão de Cursos',
      description: 'Crie e gerencie cursos com facilidade, controle candidaturas e monitore o progresso dos alunos.',
    },
    {
      icon: Users,
      title: 'Gestão de Candidatos',
      description: 'Processe candidaturas, aceite ou rejeite candidatos e mantenha registos detalhados.',
    },
    {
      icon: Mail,
      title: 'Comunicação',
      description: 'Envie emails personalizados para candidatos e alunos com templates profissionais.',
    },
    {
      icon: FileText,
      title: 'Gestão de Blog',
      description: 'Publique artigos e mantenha o blog atualizado com conteúdo relevante.',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Analítico',
      description: 'Visualize estatísticas e métricas importantes num painel intuitivo.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Coração da Jornada
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema completo de gestão para o seu centro de formação
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-3"
              onClick={() => router.push('/admin')}
            >
              Aceder ao Painel
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              Aceda ao painel de administração e comece a gerir o seu centro de formação hoje mesmo.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-3"
              onClick={() => router.push('/admin')}
            >
              Entrar no Sistema
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
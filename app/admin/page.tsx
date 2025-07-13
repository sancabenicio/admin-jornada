'use client';

import React, { useMemo } from 'react';
import { BookOpen, Users, UserCheck, FileText, Mail, AlertCircle } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/contexts/AdminContext';
import { translateCourseStatus, translateCandidateStatus, translateBlogStatus } from '@/lib/utils';

export default function AdminDashboard() {
  const { dashboardStats, courses, candidates, blogPosts } = useAdmin();

  // Calcular dados reais para o dashboard
  const realStats = useMemo(() => {
    const totalCourses = courses.length;
    const activeCourses = courses.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
    const totalCandidates = candidates.length;
    const acceptedCandidates = candidates.filter(c => c.status === 'ACCEPTED' || c.status === 'IN_TRAINING').length;
    const publishedPosts = blogPosts.filter(p => p.status === 'PUBLISHED').length;
    const pendingApplications = candidates.filter(c => c.status === 'REGISTERED').length;
    
    // Calcular taxa de aceitação
    const acceptanceRate = totalCandidates > 0 ? Math.round((acceptedCandidates / totalCandidates) * 100) : 0;
    
    // Calcular candidaturas dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentApplications = candidates.filter(c => 
      new Date(c.appliedAt) > thirtyDaysAgo
    ).length;

    return {
      totalCourses,
      activeCourses,
      totalCandidates,
      acceptedCandidates,
      publishedPosts,
      pendingApplications,
      acceptanceRate,
      recentApplications
    };
  }, [courses, candidates, blogPosts]);

  const recentCourses = courses.slice(0, 5);
  const recentCandidates = candidates.slice(0, 5);
  const recentPosts = blogPosts.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'Aberto':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
      case 'Fechado':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
      case 'Concluído':
        return 'bg-gray-100 text-gray-800';
      case 'ACCEPTED':
      case 'Aceite':
        return 'bg-green-100 text-green-800';
      case 'REGISTERED':
      case 'Registado':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      case 'PUBLISHED':
      case 'Publicado':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
      case 'Rascunho':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do sistema de gestão</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total de Cursos"
          value={realStats.totalCourses}
          icon={BookOpen}
          description={`${realStats.activeCourses} ativos`}
          trend={{ value: realStats.activeCourses, isPositive: realStats.activeCourses > 0 }}
        />
        <StatsCard
          title="Candidatos"
          value={realStats.totalCandidates}
          icon={Users}
          description={`${realStats.acceptedCandidates} aceites`}
          trend={{ value: realStats.recentApplications, isPositive: realStats.recentApplications > 0 }}
        />
        <StatsCard
          title="Artigos Publicados"
          value={realStats.publishedPosts}
          icon={FileText}
          description="No blog"
          trend={{ value: realStats.publishedPosts, isPositive: realStats.publishedPosts > 0 }}
        />
        <StatsCard
          title="Candidaturas Pendentes"
          value={realStats.pendingApplications}
          icon={AlertCircle}
          description="A aguardar revisão"
        />
        <StatsCard
          title="Taxa de Aceitação"
          value={realStats.acceptanceRate}
          icon={UserCheck}
          description="Percentagem"
        />
        <StatsCard
          title="Candidaturas Recentes"
          value={realStats.recentApplications}
          icon={Mail}
          description="Últimos 30 dias"
          trend={{ value: realStats.recentApplications, isPositive: realStats.recentApplications > 0 }}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Cursos Recentes</CardTitle>
            <CardDescription>Últimos cursos adicionados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCourses.length > 0 ? (
                recentCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{course.name}</p>
                      <p className="text-xs text-gray-500">{course.duration}</p>
                    </div>
                    <Badge className={getStatusColor(course.status)}>
                      {translateCourseStatus(course.status)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum curso encontrado</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Candidates */}
        <Card>
          <CardHeader>
            <CardTitle>Candidatos Recentes</CardTitle>
            <CardDescription>Últimas candidaturas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCandidates.length > 0 ? (
                recentCandidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{candidate.name}</p>
                      <p className="text-xs text-gray-500">{candidate.courseName}</p>
                    </div>
                    <Badge className={getStatusColor(candidate.status)}>
                      {translateCandidateStatus(candidate.status)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum candidato encontrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Blog Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Artigos Recentes</CardTitle>
          <CardDescription>Últimos posts do blog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{post.title}</p>
                    <p className="text-xs text-gray-500">{post.category}</p>
                  </div>
                  <Badge className={getStatusColor(post.status)}>
                    {translateBlogStatus(post.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum artigo encontrado</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
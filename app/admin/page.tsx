'use client';

import React from 'react';
import { BookOpen, Users, UserCheck, FileText, Mail, AlertCircle } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminDashboard() {
  const { dashboardStats, courses, candidates, blogPosts } = useAdmin();

  const recentCourses = courses.slice(0, 5);
  const recentCandidates = candidates.slice(0, 5);
  const recentPosts = blogPosts.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-green-100 text-green-800';
      case 'Em Curso':
        return 'bg-blue-100 text-blue-800';
      case 'Fechado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Concluído':
        return 'bg-gray-100 text-gray-800';
      case 'Aceite':
        return 'bg-green-100 text-green-800';
      case 'Inscrito':
        return 'bg-blue-100 text-blue-800';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      case 'Publicado':
        return 'bg-green-100 text-green-800';
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
          value={dashboardStats.totalCourses}
          icon={BookOpen}
          description={`${dashboardStats.activeCourses} ativos`}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Candidatos"
          value={dashboardStats.totalCandidates}
          icon={Users}
          description={`${dashboardStats.acceptedCandidates} aceites`}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Artigos Publicados"
          value={dashboardStats.publishedPosts}
          icon={FileText}
          description="No blog"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Candidaturas Pendentes"
          value={dashboardStats.pendingApplications}
          icon={AlertCircle}
          description="A aguardar revisão"
        />
        <StatsCard
          title="Taxa de Aceitação"
          value={Math.round((dashboardStats.acceptedCandidates / dashboardStats.totalCandidates) * 100) || 0}
          icon={UserCheck}
          description="Percentagem"
        />
        <StatsCard
          title="Comunicações Enviadas"
          value={47}
          icon={Mail}
          description="Este mês"
          trend={{ value: 23, isPositive: true }}
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
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{course.name}</p>
                    <p className="text-xs text-gray-500">{course.duration}</p>
                  </div>
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                </div>
              ))}
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
              {recentCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{candidate.name}</p>
                    <p className="text-xs text-gray-500">{candidate.courseName}</p>
                  </div>
                  <Badge className={getStatusColor(candidate.status)}>
                    {candidate.status}
                  </Badge>
                </div>
              ))}
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
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{post.title}</p>
                  <p className="text-xs text-gray-500">{post.category}</p>
                </div>
                <Badge className={getStatusColor(post.status)}>
                  {post.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
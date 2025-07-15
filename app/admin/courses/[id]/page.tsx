'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Trash2, Users, Calendar, MapPin, Euro, Clock, FileText, Mail, Phone, ExternalLink } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Course, CourseStatus, Candidate } from '@/types';
import { translateCourseStatus, translateCandidateStatus } from '@/lib/utils';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { courses, candidates, deleteCourse, updateCourse } = useAdmin();
  const [course, setCourse] = useState<Course | null>(null);
  const [courseCandidates, setCourseCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id && courses.length > 0) {
      const foundCourse = courses.find(c => c.id === params.id);
      if (foundCourse) {
        setCourse(foundCourse);
        // Filtrar candidatos deste curso
        const filteredCandidates = candidates.filter(c => c.courseId === params.id);
        setCourseCandidates(filteredCandidates);
      }
      setLoading(false);
    }
  }, [params.id, courses, candidates]);

  const handleStatusChange = (status: CourseStatus) => {
    if (course) {
      updateCourse(course.id, { status });
      setCourse({ ...course, status });
    }
  };

  const handleDeleteCourse = () => {
    if (course) {
      deleteCourse(course.id);
      router.push('/admin/courses');
    }
  };

  const handleEditCourse = () => {
    router.push(`/admin/courses?edit=${course?.id}`);
  };

  const handleViewCandidate = (candidateId: string) => {
    router.push(`/admin/candidates/${candidateId}`);
  };

  const getStatusColor = (status: CourseStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLOSED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCandidateStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REGISTERED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_TRAINING':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusCounts = () => {
    const counts = {
      REGISTERED: 0,
      ACCEPTED: 0,
      IN_TRAINING: 0,
      COMPLETED: 0,
      REJECTED: 0
    };
    
    courseCandidates.forEach(candidate => {
      counts[candidate.status as keyof typeof counts]++;
    });
    
    return counts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Curso não encontrado</h2>
          <p className="text-gray-600 mb-4">O curso que procura não existe ou foi removido.</p>
          <Button onClick={() => router.push('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Cursos
          </Button>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/courses')}
            className="border-slate-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{course.name}</h1>
            <p className="text-slate-600 mt-1">Detalhes do curso</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditCourse}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que deseja eliminar o curso "{course.name}"? Esta ação não pode ser desfeita e todos os candidatos associados serão também eliminados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteCourse}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Imagem e Informações Básicas */}
          <Card className="border-slate-200 overflow-hidden">
            {course.image && (
              <div className="relative h-64 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={`${getStatusColor(course.status)} border`}>
                    {translateCourseStatus(course.status)}
                  </Badge>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              {!course.image && (
                <div className="flex justify-end">
                  <Badge className={`${getStatusColor(course.status)} border`}>
                    {translateCourseStatus(course.status)}
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">{course.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(course.startDate).toLocaleDateString('pt-PT')} - {new Date(course.endDate).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{course.duration}</span>
                </div>
                {course.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{course.location}</span>
                  </div>
                )}
                {course.price !== undefined && course.price > 0 && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Euro className="h-4 w-4" />
                    <span className="text-sm">{course.price.toFixed(2)}€</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas dos Candidatos */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estatísticas dos Candidatos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{courseCandidates.length}</div>
                  <div className="text-sm text-slate-600">Total</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{statusCounts.REGISTERED}</div>
                  <div className="text-sm text-blue-600">Registados</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{statusCounts.ACCEPTED}</div>
                  <div className="text-sm text-green-600">Aceites</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{statusCounts.IN_TRAINING}</div>
                  <div className="text-sm text-indigo-600">Em Formação</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{statusCounts.COMPLETED}</div>
                  <div className="text-sm text-gray-600">Concluídos</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Taxa de Ocupação</span>
                  <span className="text-sm font-medium text-slate-700">
                    {courseCandidates.length}/{course.maxStudents} ({((courseCandidates.length / course.maxStudents) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((courseCandidates.length / course.maxStudents) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Candidatos */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidatos ({courseCandidates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courseCandidates.length > 0 ? (
                <div className="space-y-3">
                  {courseCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600">
                            {candidate.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{candidate.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {candidate.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {candidate.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getCandidateStatusColor(candidate.status)} text-xs`}>
                          {translateCandidateStatus(candidate.status)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCandidate(candidate.id)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Nenhum candidato registado neste curso</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estado do Curso */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Estado do Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Estado Atual</label>
                <Badge className={`${getStatusColor(course.status)} text-sm`}>
                  {translateCourseStatus(course.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Alterar Estado</label>
                <Select value={course.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Aberto</SelectItem>
                    <SelectItem value="CLOSED">Fechado</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Máximo de alunos</span>
                <span className="font-medium">{course.maxStudents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Candidatos atuais</span>
                <span className="font-medium">{courseCandidates.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Vagas disponíveis</span>
                <span className="font-medium">{Math.max(0, course.maxStudents - courseCandidates.length)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Data de criação</span>
                <span className="font-medium">
                  {new Date(course.createdAt).toLocaleDateString('pt-PT')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Última atualização</span>
                <span className="font-medium">
                  {new Date(course.updatedAt).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/admin/candidates')}
              >
                <Users className="h-4 w-4 mr-2" />
                Ver Todos os Candidatos
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/admin/communication')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Comunicação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
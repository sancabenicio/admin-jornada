'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Trash2, Download, Mail, Phone, MapPin, Calendar, FileText, User, GraduationCap, Briefcase, Heart, ExternalLink } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Candidate, CandidateStatus } from '@/types';
import { translateCandidateStatus } from '@/lib/utils';
import CandidateForm from '@/components/candidates/CandidateForm';

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { candidates, courses, deleteCandidate, updateCandidate } = useAdmin();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (params.id && candidates.length > 0) {
      const foundCandidate = candidates.find(c => c.id === params.id);
      if (foundCandidate) {
        setCandidate(foundCandidate);
      }
      setLoading(false);
    }
  }, [params.id, candidates]);

  const handleStatusChange = (status: CandidateStatus) => {
    if (candidate) {
      updateCandidate(candidate.id, { status });
      setCandidate({ ...candidate, status });
    }
  };

  const handleDeleteCandidate = () => {
    if (candidate) {
      deleteCandidate(candidate.id);
      // Redirecionar para a página correta baseado no status
      const isStudent = ['ACCEPTED', 'IN_TRAINING', 'COMPLETED'].includes(candidate.status);
      router.push(isStudent ? '/admin/students' : '/admin/candidates');
    }
  };

  const handleEditCandidate = () => {
    setShowEditForm(true);
  };

  const handleFormSubmit = () => {
    setShowEditForm(false);
  };

  const handleDownloadDocuments = async () => {
    if (!candidate?.attachments || candidate.attachments.length === 0) {
      console.log('Este candidato não tem documentos para descarregar.');
      return;
    }

    try {
      for (let index = 0; index < candidate.attachments.length; index++) {
        const url = candidate.attachments[index];
        const originalName = candidate.documentNames && candidate.documentNames[index]
          ? candidate.documentNames[index]
          : `documento_${index + 1}`;
        
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${candidate.name}_${originalName}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          
          // Pequeno delay entre downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Erro ao baixar documento ${index + 1}:`, error);
          // Fallback
          const link = document.createElement('a');
          link.href = url;
          link.download = `${candidate.name}_${originalName}`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      
      console.log(`Descarregamento iniciado para ${candidate.attachments.length} documento(s) de ${candidate.name}`);
    } catch (error) {
      console.error('Erro ao descarregar documentos:', error);
    }
  };

  const handleDownloadSingleDocument = async (url: string, index: number) => {
    try {
      const originalName = candidate?.documentNames && candidate.documentNames[index] 
        ? candidate.documentNames[index] 
        : `documento_${index + 1}`;
      
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${candidate?.name}_${originalName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      console.log(`Descarregamento iniciado: ${originalName}`);
    } catch (error) {
      console.error('Erro ao descarregar documento:', error);
      // Fallback
      const originalName = candidate?.documentNames && candidate.documentNames[index] 
        ? candidate.documentNames[index] 
        : `documento_${index + 1}`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${candidate?.name}_${originalName}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status: CandidateStatus) => {
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

  const getCourseInfo = () => {
    if (!candidate?.courseId) return null;
    return courses.find(course => course.id === candidate.courseId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar candidato...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    // Tentar determinar a página de origem baseado no parâmetro da URL
    const fromStudents = searchParams.get('from') === 'students';
    const backUrl = fromStudents ? '/admin/students' : '/admin/candidates';
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidato não encontrado</h2>
          <p className="text-gray-600 mb-4">O candidato que procura não existe ou foi removido.</p>
          <Button onClick={() => router.push(backUrl)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar {fromStudents ? 'aos Estudantes' : 'aos Candidatos'}
          </Button>
        </div>
      </div>
    );
  }

  const courseInfo = getCourseInfo();

  // Determinar a página de origem baseado no status do candidato
  const isStudent = candidate && ['ACCEPTED', 'IN_TRAINING', 'COMPLETED'].includes(candidate.status);
  const backUrl = isStudent ? '/admin/students' : '/admin/candidates';

  // Se estiver no modo de edição, mostrar o formulário
  if (showEditForm && candidate) {
    return (
      <div className="space-y-6">
        <CandidateForm
          candidate={candidate}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowEditForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(backUrl)}
            className="border-slate-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar {isStudent ? 'aos Estudantes' : 'aos Candidatos'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{candidate.name}</h1>
            <p className="text-slate-600 mt-1">Detalhes do {isStudent ? 'estudante' : 'candidato'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditCandidate}>
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
                  Tem a certeza que deseja eliminar o {isStudent ? 'estudante' : 'candidato'} &quot;{candidate.name}&quot;? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteCandidate}
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
          {/* Informações Pessoais */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Nome Completo</label>
                  <p className="text-slate-900">{candidate.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                      {candidate.email}
                    </a>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Telefone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <a href={`tel:${candidate.phone}`} className="text-blue-600 hover:underline">
                      {candidate.phone}
                    </a>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">País</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{candidate.country}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Idade</label>
                  <span>{candidate.age || 'Não especificada'}</span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Data de Candidatura</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{new Date(candidate.appliedAt).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Académicas e Profissionais */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Informações Académicas e Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Escolaridade</label>
                  <span>{candidate.education || 'Não especificada'}</span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Experiência Profissional</label>
                  <span>{candidate.experience || 'Não especificada'}</span>
                </div>
              </div>
              {candidate.motivation && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Motivação</label>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-700 whitespace-pre-wrap">{candidate.motivation}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações do Curso */}
          {courseInfo && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Informações do Curso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Curso</label>
                    <p className="text-slate-900 font-medium">{courseInfo.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Estado do Curso</label>
                    <Badge className={getStatusColor(courseInfo.status as any)}>
                      {translateCandidateStatus(courseInfo.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Duração</label>
                    <span>{courseInfo.duration}</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Localização</label>
                    <span>{courseInfo.location || 'Não especificada'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Descrição do Curso</label>
                  <p className="text-slate-700">{courseInfo.description}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documentos */}
          {candidate.attachments && candidate.attachments.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos ({candidate.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {candidate.attachments.map((url, index) => {
                    // Usar o nome original do documento se disponível, senão usar um nome genérico
                    const originalName = candidate.documentNames && candidate.documentNames[index]
                      ? candidate.documentNames[index]
                      : `Documento_${index + 1}`;

                    // Função para baixar o documento com o nome correto
                    const handleDownload = async () => {
                      try {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `${candidate.name}_${originalName}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(link.href);
                      } catch (error) {
                        console.error('Erro ao baixar documento:', error);
                        // Fallback
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${candidate.name}_${originalName}`;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    };

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={handleDownload}
                        title={`Descarregar ${originalName}`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-slate-400" />
                          <span className="text-sm text-slate-700 font-medium">
                            {originalName}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={e => { e.stopPropagation(); window.open(url, '_blank'); }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={e => { e.stopPropagation(); handleDownload(); }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Descarregar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    onClick={handleDownloadDocuments}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descarregar Todos os Documentos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estado do Candidato */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Estado do Candidato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Estado Atual</label>
                <Badge className={`${getStatusColor(candidate.status)} text-sm`}>
                  {translateCandidateStatus(candidate.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Alterar Estado</label>
                <Select value={candidate.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGISTERED">Registado</SelectItem>
                    <SelectItem value="ACCEPTED">Aceite</SelectItem>
                    <SelectItem value="IN_TRAINING">Em formação</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Dias desde a candidatura</span>
                <span className="font-medium">
                  {Math.floor((Date.now() - new Date(candidate.appliedAt).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Documentos enviados</span>
                <span className="font-medium">{candidate.attachments?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Edit, Download, Mail, Phone, Check, X, FileText, ExternalLink, GraduationCap, Award, Clock, Users, Calendar, MessageSquare, Send, Filter, BarChart3, Eye, Plus } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Candidate, CandidateStatus } from '@/types';
import { translateCandidateStatus } from '@/lib/utils';

export default function StudentsPage() {
  const router = useRouter();
  const { candidates, updateCandidate, courses, globalSearch } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const effectiveSearch = searchTerm || globalSearch;
  
  // Filtrar apenas estudantes (aceites, em formação, concluídos)
  const students = candidates.filter(candidate => 
    ['ACCEPTED', 'IN_TRAINING', 'COMPLETED'].includes(candidate.status)
  );

  const filteredStudents = students.filter(student => {
    const matches = (student.name || '').toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      (student.courseName || student.course?.name || '').toLowerCase().includes(effectiveSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || student.courseId === courseFilter;
    return matches && matchesStatus && matchesCourse;
  });

  const handleStatusChange = (id: string, status: CandidateStatus) => {
    updateCandidate(id, { status });
  };

  const handleDownloadDocuments = async (student: Candidate) => {
    if (!student.attachments || student.attachments.length === 0) {
      console.log('Este estudante não tem documentos para descarregar.');
      return;
    }

    try {
      for (let index = 0; index < student.attachments.length; index++) {
        const url = student.attachments[index];
        const originalName = student.documentNames && student.documentNames[index]
          ? student.documentNames[index]
          : `documento_${index + 1}`;
        
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${student.name}_${originalName}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Erro ao baixar documento ${index + 1}:`, error);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${student.name}_${originalName}`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      
      console.log(`Descarregamento iniciado para ${student.attachments.length} documento(s) de ${student.name}`);
    } catch (error) {
      console.error('Erro ao descarregar documentos:', error);
    }
  };

  const handleExportStudents = (statusFilter?: string) => {
    let studentsToExport = filteredStudents;
    let statusLabel = 'todos';
    
    if (statusFilter && statusFilter !== 'all') {
      studentsToExport = filteredStudents.filter(student => student.status === statusFilter);
      statusLabel = translateCandidateStatus(statusFilter as CandidateStatus).toLowerCase();
    }

    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'País', 'Idade', 'Escolaridade', 'Curso', 'Estado', 'Data de Inscrição', 'Data de Aceitação'].join(','),
      ...studentsToExport.map(student => [
        student.name,
        student.email,
        student.phone,
        student.country,
        student.age || '',
        student.education || '',
        student.courseName || student.course?.name || '',
        student.status,
        new Date(student.appliedAt).toLocaleDateString('pt-PT'),
        new Date(student.updatedAt).toLocaleDateString('pt-PT')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-PT').replace(/\//g, '-');
    
    const statusDisplay = statusFilter && statusFilter !== 'all' 
      ? translateCandidateStatus(statusFilter as CandidateStatus)
      : 'Todos';
    
    const fileName = `Estudantes_${statusDisplay}_${dateStr}.csv`;
    
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'IN_TRAINING':
        return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusCounts = () => {
    const counts = {
      ACCEPTED: 0,
      IN_TRAINING: 0,
      COMPLETED: 0
    };
    
    students.forEach(student => {
      counts[student.status as keyof typeof counts]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Funções para gestão avançada
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleBulkStatusChange = (status: CandidateStatus) => {
    selectedStudents.forEach(id => {
      updateCandidate(id, { status });
    });
    setSelectedStudents([]);
    setShowBulkActions(false);
  };

  const handleSendBulkEmail = () => {
    if (selectedStudents.length === 0) return;
    
    const selectedEmails = filteredStudents
      .filter(s => selectedStudents.includes(s.id))
      .map(s => s.email);
    
    setEmailSubject('');
    setEmailContent('');
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailContent) return;
    
    setIsSendingEmail(true);
    setEmailResult(null);
    
    try {
      const selectedStudentIds = selectedStudents;
      
      const response = await fetch('/api/communication/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailSubject,
          content: emailContent,
          recipients: 'custom',
          customRecipients: selectedStudentIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar emails');
      }

      setEmailResult(result.results);
      
      // Se todos os emails foram enviados com sucesso, fechar modal e limpar seleção
      if (result.results.failed === 0) {
        setShowEmailModal(false);
        setSelectedStudents([]);
        setShowBulkActions(false);
        setEmailSubject('');
        setEmailContent('');
      }
      
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      setEmailResult({
        success: 0,
        failed: selectedStudents.length,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStudentStats = () => {
    const totalStudents = students.length;
    const byCourse = courses.map(course => ({
      course: course.name,
      count: students.filter(s => s.courseId === course.id).length
    })).filter(item => item.count > 0);

    const byCountry = students.reduce((acc, student) => {
      acc[student.country] = (acc[student.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgAge = students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + (s.age || 0), 0) / students.length)
      : 0;

    return { totalStudents, byCourse, byCountry, avgAge };
  };

  const studentStats = getStudentStats();

  // Funções auxiliares para exportação
  const exportSelectedStudentsByStatus = (status: CandidateStatus, statusLabel: string) => {
    const selectedStudentsData = filteredStudents.filter(s => selectedStudents.includes(s.id));
    const filteredStudentsByStatus = selectedStudentsData.filter(s => s.status === status);
    
    if (filteredStudentsByStatus.length > 0) {
      const csvContent = [
        ['Nome', 'Email', 'Telefone', 'País', 'Idade', 'Escolaridade', 'Curso', 'Estado', 'Data de Inscrição', 'Data de Aceitação'].join(','),
        ...filteredStudentsByStatus.map(student => [
          student.name,
          student.email,
          student.phone,
          student.country,
          student.age || '',
          student.education || '',
          student.courseName || student.course?.name || '',
          student.status,
          new Date(student.appliedAt).toLocaleDateString('pt-PT'),
          new Date(student.updatedAt).toLocaleDateString('pt-PT')
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-PT').replace(/\//g, '-');
      const fileName = `Estudantes_${statusLabel}_Selecionados_${dateStr}.csv`;
      
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notificação de sucesso */}
      {emailResult && emailResult.failed === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Emails enviados com sucesso para {emailResult.success} estudante(s)!
            </span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Estudantes</h1>
          <p className="text-gray-600 mt-2">Gerir estudantes inscritos e em formação</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowStatsModal(true)}
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Estatísticas
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowBulkActions(!showBulkActions)}
            className={showBulkActions ? "bg-orange-50 border-orange-200 text-orange-700" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Ações em Massa
          </Button>
          
          <div className="relative group">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExportStudents()}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar Todos
                </button>
                <button
                  onClick={() => handleExportStudents('ACCEPTED')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar Aceites
                </button>
                <button
                  onClick={() => handleExportStudents('IN_TRAINING')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar Em Formação
                </button>
                <button
                  onClick={() => handleExportStudents('COMPLETED')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar Concluídos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estudantes Aceites</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.ACCEPTED}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Formação</p>
                <p className="text-2xl font-bold text-indigo-600">{statusCounts.IN_TRAINING}</p>
              </div>
              <Clock className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-purple-600">{statusCounts.COMPLETED}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações em Massa */}
      {showBulkActions && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-orange-800">
                  Selecionar Todos ({selectedStudents.length}/{filteredStudents.length})
                </span>
              </label>
            </div>
            
            {selectedStudents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('IN_TRAINING')}
                  className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Iniciar Formação
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('COMPLETED')}
                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                >
                  <Award className="h-3 w-3 mr-1" />
                  Marcar Concluído
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendBulkEmail}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Enviar Email
                </Button>
                <div className="relative group">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Exportar Selecionados
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleExportStudents()}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Exportar Todos os Selecionados
                      </button>
                      <button
                        onClick={() => exportSelectedStudentsByStatus('ACCEPTED', 'Aceites')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Exportar Aceites Selecionados
                      </button>
                      <button
                        onClick={() => exportSelectedStudentsByStatus('IN_TRAINING', 'Em_Formacao')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Exportar Em Formação Selecionados
                      </button>
                      <button
                        onClick={() => exportSelectedStudentsByStatus('COMPLETED', 'Concluidos')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Exportar Concluídos Selecionados
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar estudantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              <SelectItem value="ACCEPTED">Aceites</SelectItem>
              <SelectItem value="IN_TRAINING">Em formação</SelectItem>
              <SelectItem value="COMPLETED">Concluídos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cursos</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Estudantes em Tabela */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {showBulkActions && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 w-12">
                  <label className="sr-only">Selecionar todos</label>
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                    aria-label="Selecionar todos os estudantes"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Telefone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">País</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Idade</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Escolaridade</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Curso</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Documentos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                {showBulkActions && (
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="rounded border-gray-300"
                      aria-label={`Selecionar ${student.name}`}
                    />
                  </td>
                )}
                <td className="px-4 py-2 whitespace-nowrap font-medium text-slate-900">{student.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{student.email}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{student.phone}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{student.country}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{student.age || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{student.education || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{student.courseName || student.course?.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Badge className={getStatusColor(student.status)}>
                    {translateCandidateStatus(student.status)}
                  </Badge>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {student.attachments && student.attachments.length > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleDownloadDocuments(student)}
                    >
                      <Download className="h-3 w-3 mr-1" />Descarregar
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400">Nenhum</span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/candidates/${student.id}?from=students`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {student.status === 'ACCEPTED' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                          onClick={() => handleStatusChange(student.id, 'IN_TRAINING')}
                        >
                          <Clock className="h-4 w-4 mr-1" />Iniciar Formação
                        </Button>
                      </>
                    )}
                    {student.status === 'IN_TRAINING' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                          onClick={() => handleStatusChange(student.id, 'COMPLETED')}
                        >
                          <Award className="h-4 w-4 mr-1" />Marcar Concluído
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Nenhum estudante encontrado</div>
          <p className="text-gray-500">Tente ajustar os filtros ou verificar se há estudantes inscritos</p>
        </div>
      )}

      {/* Modal de Email */}
      <Dialog open={showEmailModal} onOpenChange={(open) => {
        setShowEmailModal(open);
        if (!open) {
          setEmailResult(null);
          setEmailSubject('');
          setEmailContent('');
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Email para {selectedStudents.length} Estudante(s)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Resultado do envio */}
            {emailResult && (
              <div className={`p-4 rounded-lg border ${
                emailResult.failed === 0 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : emailResult.success > 0 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {emailResult.failed === 0 ? (
                    <Check className="h-4 w-4" />
                  ) : emailResult.success > 0 ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {emailResult.failed === 0 
                      ? 'Emails enviados com sucesso!' 
                      : emailResult.success > 0 
                        ? 'Envio parcialmente concluído'
                        : 'Falha no envio dos emails'
                    }
                  </span>
                </div>
                <p className="text-sm">
                  Enviados: {emailResult.success} | Falharam: {emailResult.failed}
                </p>
                {emailResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Erros:</p>
                    <ul className="text-xs space-y-1">
                      {emailResult.errors.slice(0, 3).map((error, index) => (
                        <li key={index} className="text-red-600">• {error}</li>
                      ))}
                      {emailResult.errors.length > 3 && (
                        <li className="text-red-600">• ... e mais {emailResult.errors.length - 3} erros</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Assunto</label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Assunto do email..."
                className="mt-1"
                disabled={isSendingEmail}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mensagem</label>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Escreva sua mensagem..."
                rows={8}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSendingEmail}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailResult(null);
                  setEmailSubject('');
                  setEmailContent('');
                }}
                disabled={isSendingEmail}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendEmail} 
                disabled={!emailSubject || !emailContent || isSendingEmail}
              >
                {isSendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    A enviar...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Estatísticas */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estatísticas dos Estudantes</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{studentStats.totalStudents}</p>
                    <p className="text-sm text-gray-600">Total de Estudantes</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{statusCounts.ACCEPTED}</p>
                    <p className="text-sm text-gray-600">Aceites</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{statusCounts.IN_TRAINING}</p>
                    <p className="text-sm text-gray-600">Em Formação</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{statusCounts.COMPLETED}</p>
                    <p className="text-sm text-gray-600">Concluídos</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Por Curso */}
            <Card>
              <CardHeader>
                <CardTitle>Estudantes por Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentStats.byCourse.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{item.course}</span>
                      <Badge variant="secondary">{item.count} estudantes</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Por País */}
            <Card>
              <CardHeader>
                <CardTitle>Estudantes por País</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(studentStats.byCountry)
                    .sort(([,a], [,b]) => b - a)
                    .map(([country, count]) => (
                      <div key={country} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{country}</span>
                        <Badge variant="secondary">{count} estudantes</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Idade Média */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Demográficas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800">{studentStats.avgAge}</p>
                  <p className="text-sm text-gray-600">Idade Média dos Estudantes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
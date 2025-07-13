'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Download, Mail, Phone, Check, X, FileText } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import CandidateForm from '@/components/candidates/CandidateForm';
import { Candidate, CandidateStatus } from '@/types';
import { translateCandidateStatus } from '@/lib/utils';

export default function CandidatesPage() {
  const { candidates, deleteCandidate, updateCandidate, courses, globalSearch } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  const effectiveSearch = searchTerm || globalSearch;
  const filteredCandidates = candidates.filter(candidate => {
    const matches = (candidate.name || '').toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      (candidate.email || '').toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      (candidate.courseName || '').toLowerCase().includes(effectiveSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || candidate.courseId === courseFilter;
    return matches && matchesStatus && matchesCourse;
  });

  const handleAddCandidate = () => {
    setEditingCandidate(undefined);
    setShowForm(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setShowForm(true);
  };

  const handleDeleteCandidate = (id: string) => {
    deleteCandidate(id);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingCandidate(undefined);
  };

  const handleStatusChange = (id: string, status: CandidateStatus) => {
    updateCandidate(id, { status });
  };

  const handleDownloadDocuments = async (candidate: Candidate) => {
    if (!candidate.attachments || candidate.attachments.length === 0) {
      // Usar notificação em vez de alert
      console.log('Este candidato não tem documentos para descarregar.');
      return;
    }

    try {
      // Para cada documento, criar um link de download
      candidate.attachments.forEach((url, index) => {
        const link = document.createElement('a');
        link.href = url;
        
        // Extrair nome do arquivo da URL
        const fileName = url.split('/').pop() || `documento_${index + 1}`;
        link.download = `${candidate.name}_${fileName}`;
        
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      
      console.log(`Descarregamento iniciado para ${candidate.attachments.length} documento(s) de ${candidate.name}`);
    } catch (error) {
      console.error('Erro ao descarregar documentos:', error);
    }
  };

  const handleViewDocuments = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowDocumentsModal(true);
  };

  const handleDownloadSingleDocument = async (url: string, candidateName: string, index: number) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo da URL
      const fileName = url.split('/').pop() || `documento_${index + 1}`;
      link.download = `${candidateName}_${fileName}`;
      
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Descarregamento iniciado: ${fileName}`);
    } catch (error) {
      console.error('Erro ao descarregar documento:', error);
    }
  };

  const handleExportCandidates = () => {
    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'Curso', 'Estado', 'Data de Candidatura'].join(','),
      ...filteredCandidates.map(candidate => [
        candidate.name,
        candidate.email,
        candidate.phone,
        candidate.courseName,
        candidate.status,
        new Date(candidate.appliedAt).toLocaleDateString('pt-PT')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidatos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REGISTERED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_TRAINING':
        return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <CandidateForm
          candidate={editingCandidate}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Candidatos</h1>
          <p className="text-gray-600 mt-2">Gerir candidatos e candidaturas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCandidates}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleAddCandidate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Candidato
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar candidatos..."
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
              <SelectItem value="REGISTERED">Registado</SelectItem>
              <SelectItem value="ACCEPTED">Aceite</SelectItem>
              <SelectItem value="IN_TRAINING">Em formação</SelectItem>
              <SelectItem value="COMPLETED">Concluído</SelectItem>
              <SelectItem value="REJECTED">Rejeitado</SelectItem>
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

      {/* Lista de Candidatos em Tabela */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Telefone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">País</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Curso</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Documentos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 whitespace-nowrap font-medium text-slate-900">{candidate.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{candidate.email}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{candidate.phone}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{candidate.country}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{candidate.courseName}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Badge className={getStatusColor(candidate.status)}>
                    {translateCandidateStatus(candidate.status)}
                  </Badge>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {candidate.attachments && candidate.attachments.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleViewDocuments(candidate)}
                        >
                          <FileText className="h-3 w-3 mr-1" />Ver Todos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleDownloadDocuments(candidate)}
                        >
                          <Download className="h-3 w-3 mr-1" />Descarregar Todos
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Nenhum</span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCandidate(candidate)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem a certeza que deseja eliminar o candidato "{candidate.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCandidate(candidate.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {candidate.status === 'REGISTERED' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-100 text-green-800 hover:bg-green-200"
                          onClick={() => handleStatusChange(candidate.id, 'ACCEPTED')}
                        >
                          <Check className="h-4 w-4 mr-1" />Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => handleStatusChange(candidate.id, 'REJECTED')}
                        >
                          <X className="h-4 w-4 mr-1" />Rejeitar
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

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Nenhum candidato encontrado</div>
          <p className="text-gray-500">Tente ajustar os filtros ou adicione um novo candidato</p>
        </div>
      )}

      {/* Documents Modal */}
      <Dialog open={showDocumentsModal} onOpenChange={setShowDocumentsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Documentos de {selectedCandidate?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCandidate && selectedCandidate.attachments && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCandidate.attachments.map((url, index) => {
                  const fileName = url.split('/').pop() || `Documento ${index + 1}`;
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                  const isPDF = /\.pdf$/i.test(fileName);
                  
                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">{fileName}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadSingleDocument(url, selectedCandidate.name, index)}
                          className="h-8 px-2"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Preview */}
                      <div className="border rounded bg-gray-50 p-2">
                        {isImage ? (
                          <img 
                            src={url} 
                            alt={fileName}
                            className="w-full h-32 object-cover rounded"
                          />
                        ) : isPDF ? (
                          <div className="flex items-center justify-center h-32 bg-white rounded border">
                            <div className="text-center">
                              <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
                              <p className="text-xs text-gray-600">PDF - Clique para descarregar</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 bg-white rounded border">
                            <div className="text-center">
                              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                              <p className="text-xs text-gray-600">Documento - Clique para descarregar</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => handleDownloadDocuments(selectedCandidate)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descarregar Todos os Documentos
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
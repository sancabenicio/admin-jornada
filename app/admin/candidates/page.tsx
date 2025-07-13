'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Download, Mail, Phone, Check, X } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import CandidateForm from '@/components/candidates/CandidateForm';
import { Candidate, CandidateStatus } from '@/types';

export default function CandidatesPage() {
  const { candidates, deleteCandidate, updateCandidate, courses } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || candidate.courseId === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
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
      case 'Aceite':
        return 'bg-green-100 text-green-800';
      case 'Inscrito':
        return 'bg-blue-100 text-blue-800';
      case 'Em Formação':
        return 'bg-indigo-100 text-indigo-800';
      case 'Concluído':
        return 'bg-gray-100 text-gray-800';
      case 'Rejeitado':
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
              <SelectItem value="Inscrito">Inscrito</SelectItem>
              <SelectItem value="Aceite">Aceite</SelectItem>
              <SelectItem value="Em Formação">Em Formação</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Rejeitado">Rejeitado</SelectItem>
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

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{candidate.name}</CardTitle>
                <Badge className={getStatusColor(candidate.status)}>
                  {candidate.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{candidate.contact}</span>
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">País:</span> {candidate.country}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Curso:</span> {candidate.courseName}
                </div>
                {candidate.documentType && (
                  <div className="text-gray-600">
                    <span className="font-medium">Documento:</span> {candidate.documentType}
                  </div>
                )}
                {candidate.documents && candidate.documents.length > 0 && (
                  <div className="text-gray-600">
                    <span className="font-medium">Ficheiros:</span> {candidate.documents.length} documento{candidate.documents.length !== 1 ? 's' : ''}
                  </div>
                )}
                <div className="text-gray-500">
                  <span className="font-medium">Candidatura:</span> {new Date(candidate.appliedAt).toLocaleDateString('pt-PT')}
                </div>
              </div>

              {candidate.status === 'Inscrito' && (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(candidate.id, 'Aceite')}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Aceitar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(candidate.id, 'Rejeitado')}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Nenhum candidato encontrado</div>
          <p className="text-gray-500">Tente ajustar os filtros ou adicione um novo candidato</p>
        </div>
      )}
    </div>
  );
}
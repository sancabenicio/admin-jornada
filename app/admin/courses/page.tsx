'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Users, Calendar, MapPin, Euro, ExternalLink } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import CourseForm from '@/components/courses/CourseForm';
import { Course, CourseStatus } from '@/types';
import { translateCourseStatus } from '@/lib/utils';

export default function CoursesPage() {
  const router = useRouter();
  const { courses, deleteCourse, loading, loadCourses } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.location && course.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddCourse = () => {
    setEditingCourse(undefined);
    setShowForm(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDeleteCourse = (id: string) => {
    deleteCourse(id);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingCourse(undefined);
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

  if (showForm) {
    return (
      <div className="space-y-6">
        <CourseForm
          course={editingCourse}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Cursos</h1>
          <p className="text-slate-600 mt-2">Gerir cursos e candidaturas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddCourse} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-blue-400"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-slate-200 focus:border-blue-400">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="OPEN">Aberto</SelectItem>
                  <SelectItem value="CLOSED">Fechado</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading.courses && (
        <Card className="border-slate-200">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">A carregar cursos...</p>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      {!loading.courses && (
        <div className="grid mobile-grid tablet-grid desktop-grid gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-all duration-200 border-slate-200 overflow-hidden group">
              {course.image && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={`${getStatusColor(course.status)} border`}>
                      {translateCourseStatus(course.status)}
                    </Badge>
                  </div>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2 text-slate-900">{course.name}</CardTitle>
                  {!course.image && (
                    <Badge className={`${getStatusColor(course.status)} border ml-2`}>
                      {translateCourseStatus(course.status)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600 text-sm line-clamp-2">{course.description}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-slate-500">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(course.startDate).toLocaleDateString('pt-PT')} - {new Date(course.endDate).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-500">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{course.candidatesCount}/{course.maxStudents} candidatos</span>
                  </div>
                  {course.location && (
                    <div className="flex items-center text-slate-500">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{course.location}</span>
                    </div>
                  )}
                  {course.price !== undefined && course.price > 0 && (
                    <div className="flex items-center text-slate-500">
                      <Euro className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{course.price.toFixed(2)}€</span>
                    </div>
                  )}
                  <div className="text-slate-500">
                    <span className="font-medium">Duração:</span> {course.duration}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/courses/${course.id}`)}
                    className="border-slate-200 hover:border-green-300 hover:text-green-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCourse(course)}
                    className="border-slate-200 hover:border-blue-300 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-slate-200 hover:border-red-300 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem a certeza que deseja eliminar o curso &quot;{course.name}&quot;? Esta ação não pode ser desfeita e todos os candidatos associados serão também eliminados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteCourse(course.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
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
      )}

      {!loading.courses && filteredCourses.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="text-center py-12">
            <div className="text-slate-400 text-lg mb-2">Nenhum curso encontrado</div>
            <p className="text-slate-500">Tente ajustar os filtros ou adicione um novo curso</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
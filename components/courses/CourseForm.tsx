'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Course, CourseStatus } from '@/types';
import { useAdmin } from '@/contexts/AdminContext';
import { uploadImageToCloudinary } from '@/lib/services/cloudinary.service';

interface CourseFormProps {
  course?: Course;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function CourseForm({ course, onSubmit, onCancel }: CourseFormProps) {
  const { addCourse, updateCourse } = useAdmin();
  function toDateInputValue(dateString?: string) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const off = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() - off);
    return d.toISOString().slice(0, 10);
  }
  const [formData, setFormData] = useState({
    name: course?.name || '',
    description: course?.description || '',
    duration: course?.duration || '',
    startDate: course ? toDateInputValue(course.startDate) : '',
    endDate: course ? toDateInputValue(course.endDate) : '',
    maxStudents: course?.maxStudents || 20,
    applicationLimit: course?.applicationLimit || 40,
    status: course?.status || 'Aberto' as CourseStatus,
    image: course?.image || '',
    price: course?.price || 0,
    location: course?.location || ''
  });
  const [dateError, setDateError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const dataInicio = formData.startDate ? new Date(formData.startDate) : null;
    const dataFim = formData.endDate ? new Date(formData.endDate) : null;
    
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setDateError('A data de início não pode ser posterior à data de fim.');
      return;
    }
    
    if (!course && dataInicio && dataInicio < hoje) {
      setDateError('A data de início não pode ser anterior à data atual.');
      return;
    }
    
    const startDateISO = formData.startDate ? new Date(formData.startDate).toISOString() : '';
    const endDateISO = formData.endDate ? new Date(formData.endDate).toISOString() : '';
    const dataToSend = {
      ...formData,
      startDate: startDateISO,
      endDate: endDateISO,
      maxStudents: Number(formData.maxStudents),
      applicationLimit: Number(formData.applicationLimit),
      price: Number(formData.price)
    };
    try {
      if (course) {
        await updateCourse(course.id, dataToSend);
      } else {
        await addCourse(dataToSend);
      }
      onSubmit();
    } catch (err: any) {
      if (err.message && err.message.includes('Dados inválidos')) {
        setDateError('Dados inválidos: verifique todos os campos e as datas.');
      } else {
        setDateError('Erro ao criar curso.');
      }
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          handleChange('image', imageUrl);
        };
        reader.readAsDataURL(file);
        
        const cloudinaryUrl = await uploadImageToCloudinary(file);
        handleChange('image', cloudinaryUrl);
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
      }
    }
  };

  const removeImage = () => {
    handleChange('image', '');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <CardTitle className="text-2xl text-slate-900">
            {course ? 'Editar Curso' : 'Novo Curso'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {dateError && (
              <div className="text-red-600 text-sm font-medium mb-2">{dateError}</div>
            )}
            {/* Course Image */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Imagem do Curso</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                {formData.image ? (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Course preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <div className="space-y-2">
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Upload className="h-4 w-4 mr-2" />
                          Carregar Imagem
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-slate-500">
                        PNG, JPG, GIF até 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">Nome do Curso</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="h-11"
                  placeholder="Ex: Desenvolvimento Web Full Stack"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-base font-medium">Duração</Label>
                <Input
                  id="duration"
                  placeholder="ex: 320 horas (16 semanas)"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="resize-none"
                placeholder="Descreva o curso, objetivos e competências a desenvolver..."
                required
              />
            </div>

            {/* Dates and Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-base font-medium">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-base font-medium">Data de Fim</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-medium">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="h-11"
                  placeholder="Ex: Online, Lisboa, Porto..."
                />
              </div>
            </div>

            {/* Numbers and Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxStudents" className="text-base font-medium">Nº de Vagas</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={(e) => handleChange('maxStudents', parseInt(e.target.value))}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicationLimit" className="text-base font-medium">Limite de Candidaturas</Label>
                <Input
                  id="applicationLimit"
                  type="number"
                  min="1"
                  value={formData.applicationLimit}
                  onChange={(e) => handleChange('applicationLimit', parseInt(e.target.value))}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-base font-medium">Preço (€)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                  className="h-11"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-medium">Estado</Label>
                <Select value={formData.status} onValueChange={(value: CourseStatus) => handleChange('status', value)}>
                  <SelectTrigger className="h-11">
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
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={onCancel} className="px-6">
                Cancelar
              </Button>
              <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700">
                {course ? 'Atualizar' : 'Criar'} Curso
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
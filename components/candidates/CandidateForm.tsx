'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText, Image as ImageIcon, File, CreditCard, Copy, AlertCircle } from 'lucide-react';
import { Candidate, CandidateStatus } from '@/types';
import { useAdmin } from '@/contexts/AdminContext';
import { uploadDocumentToCloudinary } from '@/lib/services/cloudinary.service';

interface CandidateFormProps {
  candidate?: Candidate;
  onSubmit: () => void;
  onCancel: () => void;
}

// Remover courseOptions e usar courses do contexto

const documentTypes = [
  'Três Certificados ( 10º, 11º e 12º ano.)',
  'Passaporte'
];

export default function CandidateForm({ candidate, onSubmit, onCancel }: CandidateFormProps) {
  const { addCandidate, updateCandidate, courses } = useAdmin();
  const [formData, setFormData] = useState({
    name: candidate?.name || '',
    email: candidate?.email || '',
    country: candidate?.country || '',
    contact: candidate?.phone || '',
    courseId: candidate?.courseId || '',
    courseName: candidate?.courseName || '',
    status: candidate?.status || 'REGISTERED' as CandidateStatus,
    notes: candidate?.notes || '',
    documentTypes: [] as string[],
    documents: candidate?.attachments || []
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    // Validar campos obrigatórios
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'País é obrigatório';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = 'Telefone é obrigatório';
    }
    if (!formData.courseId) {
      newErrors.courseId = 'É obrigatório selecionar um curso';
    }
    if (uploadedFiles.length === 0 && formData.documents.length === 0) {
      newErrors.documents = 'É obrigatório submeter pelo menos um documento';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Upload files to Cloudinary
      const uploadPromises = uploadedFiles.map(file => uploadDocumentToCloudinary(file));
      const cloudinaryUrls = await Promise.all(uploadPromises);
      
      const candidateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        country: formData.country.trim(),
        phone: formData.contact.trim(),
        courseId: formData.courseId,
        status: formData.status || 'REGISTERED',
        notes: formData.notes || '',
        attachments: [...(formData.documents || []), ...cloudinaryUrls]
      };

      console.log('Dados do candidato a enviar:', candidateData);

      if (candidate) {
        await updateCandidate(candidate.id, candidateData);
      } else {
        await addCandidate(candidateData);
      }
      onSubmit();
    } catch (error) {
      console.error('Erro ao criar candidato:', error);
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'Erro ao criar candidato. Tente novamente.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleDocumentTypeChange = (documentType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      documentTypes: checked 
        ? [...prev.documentTypes, documentType]
        : prev.documentTypes.filter((type: string) => type !== documentType)
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      const maxSize = 100 * 1024 * 1024; // 100MB
      
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    const remainingSlots = 10 - uploadedFiles.length;
    
    if (validFiles.length > remainingSlots) {
      alert(`Pode adicionar apenas mais ${remainingSlots} ficheiro(s). Remova alguns ficheiros primeiro.`);
      return;
    }

    if (uploadedFiles.length + validFiles.length > 10) {
      alert('Máximo de 10 ficheiros permitidos');
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_: File, i: number) => i !== index));
  };

  const removeExistingDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_: string, i: number) => i !== index)
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (uploadedFiles.length >= 10) {
      alert('Limite de 10 ficheiros atingido. Remova alguns ficheiros primeiro.');
      return;
    }
    
    handleFileUpload(e.dataTransfer.files);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (extension === 'pdf') {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <CardTitle className="text-2xl text-slate-900">
            {candidate ? 'Editar Candidato' : 'Novo Candidato'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center text-red-800">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Erro ao criar candidato</span>
                </div>
                <p className="text-red-700 mt-1">{errors.submit}</p>
              </div>
            )}
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`h-11 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="Nome completo do candidato"
                    required
                  />
                  {errors.name && (
                    <div className="flex items-center text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`h-11 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="email@exemplo.com"
                    required
                  />
                  {errors.email && (
                    <div className="flex items-center text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-base font-medium">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className={`h-11 ${errors.country ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="Ex: Portugal, Brasil, Angola..."
                    required
                  />
                  {errors.country && (
                    <div className="flex items-center text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.country}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-base font-medium">Contacto</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => handleChange('contact', e.target.value)}
                    className={`h-11 ${errors.contact ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="Número de telefone"
                    required
                  />
                  {errors.contact && (
                    <div className="flex items-center text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contact}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Course Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Informações do Curso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseId" className="text-base font-medium">Indique o curso</Label>
                  <Select value={formData.courseId} onValueChange={(courseId) => handleChange('courseId', courseId)}>
                    <SelectTrigger className={`h-11 ${errors.courseId ? 'border-red-500 focus:border-red-500' : ''}`}>
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.courseId && (
                    <div className="flex items-center text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.courseId}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-base font-medium">Estado</Label>
                  <Select value={formData.status} onValueChange={(value: CandidateStatus) => handleChange('status', value)}>
                    <SelectTrigger className="h-11">
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
              </div>
            </div>

            {/* Document Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Documentação
              </h3>
              
              {/* Document Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Indique o(s) documento(s) submetido(s)</Label>
                <div className="space-y-3">
                  {documentTypes.map(type => (
                    <div key={type} className="flex items-center space-x-3">
                      <Checkbox
                        id={type}
                        checked={formData.documentTypes.includes(type)}
                        onCheckedChange={(checked) => handleDocumentTypeChange(type, checked as boolean)}
                      />
                      <Label htmlFor={type} className="text-sm cursor-pointer flex-1">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-green-800">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Informações de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-green-800">Taxa de Candidatura</Label>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                        <span className="text-lg font-bold text-green-700">75€</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard('75')}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-green-800">IBAN</Label>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                        <span className="text-sm font-mono text-green-700">PT50003501960003087913034</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard('PT50003501960003087913034')}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
                    <strong>Nota:</strong> O pagamento da taxa de candidatura é obrigatório para completar o processo de inscrição.
                  </div>
                </CardContent>
              </Card>

              {/* File Upload Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Coloque os Documentos aqui</Label>
                  <div className="text-sm text-slate-500">
                    {uploadedFiles.length}/10 ficheiros
                  </div>
                </div>
                {errors.documents && (
                  <div className="flex items-center text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.documents}
                  </div>
                )}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : uploadedFiles.length >= 10
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-300 hover:border-blue-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <div className="space-y-2">
                      <label className={`cursor-pointer ${uploadedFiles.length >= 10 ? 'pointer-events-none opacity-50' : ''}`}>
                        <span className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                          uploadedFiles.length >= 10 
                            ? 'bg-red-600 text-white' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadedFiles.length >= 10 ? 'Limite Atingido' : 'Carregar Ficheiros'}
                        </span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                          disabled={uploadedFiles.length >= 10}
                        />
                      </label>
                      <p className="text-sm text-slate-500">
                        ou arraste e solte os ficheiros aqui
                      </p>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 space-y-1">
                      <p>Carregue até <strong>10 ficheiros</strong> suportados:</p>
                      <p>PDF, Word (.doc, .docx), Imagens (.jpg, .jpeg, .png, .gif)</p>
                      <p>Máximo de 100 MB por ficheiro</p>
                      {uploadedFiles.length >= 10 && (
                        <p className="text-red-500 font-medium">Limite de 10 ficheiros atingido</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Documents */}
              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Documentos Existentes</Label>
                  <div className="space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(doc)}
                          <span className="text-sm text-slate-700">{doc}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExistingDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700">Ficheiros a Carregar</Label>
                    <Badge variant="outline" className="text-xs">
                      {uploadedFiles.length} ficheiro{uploadedFiles.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.name)}
                          <div>
                            <span className="text-sm text-slate-700 block">{file.name}</span>
                            <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-medium">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="resize-none"
                placeholder="Notas adicionais sobre o candidato..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className="px-6"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="px-6 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'A processar...'
                ) : (
                  `${candidate ? 'Atualizar' : 'Adicionar'} Candidato`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
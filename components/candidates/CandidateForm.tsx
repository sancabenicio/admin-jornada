'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText, Image as ImageIcon, File, CreditCard, Copy } from 'lucide-react';
import { Candidate, CandidateStatus } from '@/types';
import { useAdmin } from '@/contexts/AdminContext';

interface CandidateFormProps {
  candidate?: Candidate;
  onSubmit: () => void;
  onCancel: () => void;
}

const courseOptions = [
  'Edição de Vídeo',
  'Auxiliar de Farmácia ( Ter equivalência português)',
  'Treinador de Futebol',
  'Marketing',
  'Comércio'
];

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
    contact: candidate?.contact || '',
    courseId: candidate?.courseId || '',
    courseName: candidate?.courseName || '',
    status: candidate?.status || 'Inscrito' as CandidateStatus,
    notes: candidate?.notes || '',
    documentTypes: candidate?.documentType ? candidate.documentType.split(', ') : [] as string[],
    documents: candidate?.documents || []
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert files to base64 or file names for storage
    const documentNames = uploadedFiles.map(file => file.name);
    
    const candidateData = {
      ...formData,
      documentType: formData.documentTypes.join(', '),
      documents: [...formData.documents, ...documentNames]
    };

    if (candidate) {
      updateCandidate(candidate.id, candidateData);
    } else {
      addCandidate(candidateData);
    }
    onSubmit();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCourseChange = (courseName: string) => {
    const course = courses.find(c => c.name === courseName);
    setFormData(prev => ({
      ...prev,
      courseName,
      courseId: course?.id || ''
    }));
  };

  const handleDocumentTypeChange = (documentType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      documentTypes: checked 
        ? [...prev.documentTypes, documentType]
        : prev.documentTypes.filter(type => type !== documentType)
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

    if (uploadedFiles.length + validFiles.length > 10) {
      alert('Máximo de 10 ficheiros permitidos');
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
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
                    className="h-11"
                    placeholder="Nome completo do candidato"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="h-11"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-base font-medium">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="h-11"
                    placeholder="Ex: Portugal, Brasil, Angola..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-base font-medium">Contacto</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => handleChange('contact', e.target.value)}
                    className="h-11"
                    placeholder="Número de telefone"
                    required
                  />
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
                  <Label htmlFor="courseName" className="text-base font-medium">Indique o curso</Label>
                  <Select value={formData.courseName} onValueChange={handleCourseChange}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseOptions.map(course => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-base font-medium">Estado</Label>
                  <Select value={formData.status} onValueChange={(value: CandidateStatus) => handleChange('status', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inscrito">Inscrito</SelectItem>
                      <SelectItem value="Aceite">Aceite</SelectItem>
                      <SelectItem value="Em Formação">Em Formação</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Rejeitado">Rejeitado</SelectItem>
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
                <Label className="text-base font-medium">Coloque os Documentos aqui</Label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
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
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Upload className="h-4 w-4 mr-2" />
                          Carregar Ficheiros
                        </span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-slate-500">
                        ou arraste e solte os ficheiros aqui
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Carregue até 10 ficheiros suportados: PDF, document ou image. Máximo de 100 MB por ficheiro.
                    </p>
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
                  <Label className="text-sm font-medium text-slate-700">Ficheiros a Carregar</Label>
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
              <Button type="button" variant="outline" onClick={onCancel} className="px-6">
                Cancelar
              </Button>
              <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700">
                {candidate ? 'Atualizar' : 'Adicionar'} Candidato
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
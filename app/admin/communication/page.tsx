'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Send, Users, BookOpen, Wifi } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { translateCandidateStatus } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CommunicationPage() {
  const { candidates, courses, emailTemplates } = useAdmin();
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    recipients: 'all' as 'all' | 'course' | 'status' | 'custom',
    courseId: '',
    status: '',
    customRecipients: [] as string[]
  });

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastEmailResult, setLastEmailResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [showSmtpSuccess, setShowSmtpSuccess] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailData(prev => ({
        ...prev,
        subject: template.subject,
        content: template.content
      }));
    }
  };

  const getRecipientsList = () => {
    switch (emailData.recipients) {
      case 'all':
        return candidates;
      case 'course':
        return candidates.filter(c => c.courseId === emailData.courseId);
      case 'status':
        return candidates.filter(c => c.status === emailData.status);
      case 'custom':
        return candidates.filter(c => emailData.customRecipients.includes(c.id));
      default:
        return [];
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    const recipients = getRecipientsList();
    
    try {
      const response = await fetch('/api/communication/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailData.subject,
          content: emailData.content,
          recipients: emailData.recipients,
          courseId: emailData.courseId,
          status: emailData.status,
          customRecipients: emailData.customRecipients,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar emails');
      }

      setLastEmailResult(result.results);
      
      // Reset form
      setEmailData({
        subject: '',
        content: '',
        recipients: 'all',
        courseId: '',
        status: '',
        customRecipients: []
      });
      setSelectedTemplate('');
    } catch (error) {
      console.error('Erro ao enviar emails:', error);
      alert(`Erro ao enviar emails: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleCustomRecipientToggle = (candidateId: string) => {
    setEmailData(prev => ({
      ...prev,
      customRecipients: prev.customRecipients.includes(candidateId)
        ? prev.customRecipients.filter(id => id !== candidateId)
        : [...prev.customRecipients, candidateId]
    }));
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await fetch('/api/communication/test', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setShowSmtpSuccess(true);
      } else {
        alert('Falha na conexão SMTP. Verifique as configurações.');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      alert('Erro ao testar conexão SMTP');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const recipientCount = getRecipientsList().length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comunicação</h1>
          <p className="text-gray-600 mt-2">Enviar emails para candidatos e gerir comunicações</p>
        </div>
        <Button
          onClick={handleTestConnection}
          disabled={isTestingConnection}
          variant="outline"
          size="sm"
        >
          {isTestingConnection ? (
            'A testar...'
          ) : (
            <>
              <Wifi className="h-4 w-4 mr-2" />
              Testar Conexão
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Novo Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label htmlFor="template">Template (Opcional)</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <Label>Destinatários</Label>
                <Select value={emailData.recipients} onValueChange={(value: any) => setEmailData(prev => ({ ...prev, recipients: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os candidatos</SelectItem>
                    <SelectItem value="course">Por curso</SelectItem>
                    <SelectItem value="status">Por estado</SelectItem>
                    <SelectItem value="custom">Seleção personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course Filter */}
              {emailData.recipients === 'course' && (
                <div className="space-y-2">
                  <Label>Curso</Label>
                  <Select value={emailData.courseId} onValueChange={(value) => setEmailData(prev => ({ ...prev, courseId: value }))}>
                    <SelectTrigger>
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
                </div>
              )}

              {/* Status Filter */}
              {emailData.recipients === 'status' && (
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={emailData.status} onValueChange={(value) => setEmailData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estado" />
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
              )}

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Assunto do email"
                  required
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={emailData.content}
                  onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Conteúdo do email..."
                  rows={8}
                  required
                />
              </div>

              {/* Send Button */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {recipientCount} destinatário{recipientCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  onClick={handleSendEmail}
                  disabled={isSending || !emailData.subject || !emailData.content || recipientCount === 0}
                >
                  {isSending ? (
                    'A enviar...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recipients Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Destinatários</CardTitle>
            </CardHeader>
            <CardContent>
              {emailData.recipients === 'custom' ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {candidates.map(candidate => (
                    <div key={candidate.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={candidate.id}
                        checked={emailData.customRecipients.includes(candidate.id)}
                        onCheckedChange={() => handleCustomRecipientToggle(candidate.id)}
                      />
                      <label htmlFor={candidate.id} className="text-sm cursor-pointer flex-1">
                        <div>{candidate.name}</div>
                        <div className="text-gray-500 text-xs">{candidate.email}</div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getRecipientsList().map(candidate => (
                    <div key={candidate.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm font-medium">{candidate.name}</div>
                        <div className="text-xs text-gray-500">{candidate.email}</div>
                      </div>
                      <Badge className="text-xs">
                        {translateCandidateStatus(candidate.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Last Email Result */}
      {lastEmailResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Último Envio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Enviados: {lastEmailResult.success}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Falharam: {lastEmailResult.failed}</span>
                </div>
              </div>
              {lastEmailResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Erros:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {lastEmailResult.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Templates de Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailTemplates.map(template => (
              <div key={template.id} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.content}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {'{nome}'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {'{email}'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {'{curso}'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {'{estado}'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {'{pais}'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {'{telefone}'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSmtpSuccess} onOpenChange={setShowSmtpSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conexão SMTP</DialogTitle>
          </DialogHeader>
          <div className="text-green-700 text-lg font-semibold py-4 text-center">
            Conexão SMTP estabelecida com sucesso!
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowSmtpSuccess(false)} className="bg-blue-600 hover:bg-blue-700">OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
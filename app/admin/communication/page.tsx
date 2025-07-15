'use client';

import React, { useState } from 'react';
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
import { v4 as uuidv4 } from 'uuid';
import { EmailTemplate } from '@/types';

// Função utilitária para extrair variáveis do texto do template
function extractVariables(text: string): string[] {
  const matches = text.matchAll(/\{(\w+)\}/g);
  const vars = Array.from(matches, m => m[1]);
  // Remover duplicados
  return Array.from(new Set(vars));
}

export default function CommunicationPage() {
  const { candidates, courses, emailTemplates, addEmailTemplate, deleteEmailTemplate } = useAdmin();
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
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [showResendError, setShowResendError] = useState<string | null>(null);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [showTemplateSuccess, setShowTemplateSuccess] = useState(false);

  // Formulário de novo template
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'WELCOME' as EmailTemplate['type'],
  });

  // Remover estado local de templates
  // const [templates, setTemplates] = useState<EmailTemplate[]>(emailTemplates);

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
      
      // Show success message with details
      if (result.results.success > 0) {
        setShowEmailSuccess(true);
        setTimeout(() => setShowEmailSuccess(false), 5000); // Hide after 5 seconds
      }
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
    setShowResendError(null);
    try {
      const response = await fetch('/api/communication/test', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setShowResendSuccess(true);
      } else {
        setShowResendError(result.message || 'Falha na conexão com Resend. Verifique as configurações.');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setShowResendError('Erro ao testar conexão com Resend.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Atualizar para usar o contexto/API
  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) return;
    try {
      await addEmailTemplate(newTemplate);
      setNewTemplate({ name: '', subject: '', content: '', type: 'WELCOME' });
      setShowTemplateSuccess(true);
      setTimeout(() => setShowTemplateSuccess(false), 3000); // Hide after 3 seconds
    } catch (error) {
      alert('Erro ao criar template.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteEmailTemplate(id);
    } catch (error) {
      alert('Erro ao remover template.');
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

      {showResendError && (
        <div className="flex items-center space-x-2 bg-red-100 border border-red-300 text-red-700 rounded p-3 my-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          <span>{showResendError}</span>
        </div>
      )}

      {showEmailSuccess && lastEmailResult && (
        <div className="flex items-center justify-between bg-green-100 border border-green-300 text-green-700 rounded p-4 my-4">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-semibold">Email enviado com sucesso!</div>
              <div className="text-sm">
                {lastEmailResult.success} de {lastEmailResult.success + lastEmailResult.failed} emails foram enviados.
                {lastEmailResult.failed > 0 && ` ${lastEmailResult.failed} falharam.`}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowEmailSuccess(false)}
            className="text-green-600 hover:text-green-800"
            title="Fechar notificação"
            aria-label="Fechar notificação de sucesso"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {showTemplateSuccess && (
        <div className="flex items-center justify-between bg-blue-100 border border-blue-300 text-blue-700 rounded p-4 my-4">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-semibold">Template criado com sucesso!</div>
              <div className="text-sm">O template foi adicionado e está disponível para uso.</div>
            </div>
          </div>
          <button 
            onClick={() => setShowTemplateSuccess(false)}
            className="text-blue-600 hover:text-blue-800"
            title="Fechar notificação"
            aria-label="Fechar notificação de sucesso"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

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
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 bg-red-100 border border-red-300 text-red-700 rounded p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                    <span className="font-medium">Alguns emails não foram enviados:</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {lastEmailResult.errors.map((error, index) => {
                      // Extrair apenas a mensagem amigável
                      const match = error.match(/Erro ao enviar para ([^:]+): (.*)/);
                      const email = match ? match[1] : null;
                      const message = match ? match[2] : error;
                      return (
                        <div key={index} className="text-xs text-red-700 bg-red-50 p-2 rounded flex items-center gap-2">
                          {email && <span className="font-semibold">{email}:</span>}
                          <span>{message}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Criar Novo Template */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTemplate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nome</Label>
              <Input id="template-name" value={newTemplate.name} onChange={e => setNewTemplate(t => ({ ...t, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-type">Tipo</Label>
              <Select value={newTemplate.type} onValueChange={value => setNewTemplate(t => ({ ...t, type: value as EmailTemplate['type'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WELCOME">Boas-vindas</SelectItem>
                  <SelectItem value="ACCEPTANCE">Aceitação</SelectItem>
                  <SelectItem value="REJECTION">Rejeição</SelectItem>
                  <SelectItem value="REMINDER">Lembrete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-subject">Assunto</Label>
              <Input id="template-subject" value={newTemplate.subject} onChange={e => setNewTemplate(t => ({ ...t, subject: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-content">Conteúdo</Label>
              <Textarea id="template-content" value={newTemplate.content} onChange={e => setNewTemplate(t => ({ ...t, content: e.target.value }))} required rows={5} />
            </div>
            <Button type="submit">Adicionar Template</Button>
          </form>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Templates de Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailTemplates.map(template => {
              const variables = Array.from(new Set([
                ...extractVariables(template.subject),
                ...extractVariables(template.content)
              ]));
              return (
                <div key={template.id} className="p-4 border rounded-lg relative">
                  <button onClick={() => handleDeleteTemplate(template.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" title="Remover">&times;</button>
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <span className="text-xs bg-gray-100 rounded px-2 py-1 mr-2">{template.type}</span>
                  <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {variables.map(variable => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {'{' + variable + '}'}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResendSuccess} onOpenChange={setShowResendSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conexão Resend</DialogTitle>
          </DialogHeader>
          <div className="text-green-700 text-lg font-semibold py-4 text-center">
            Conexão com Resend estabelecida com sucesso!
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowResendSuccess(false)} className="bg-blue-600 hover:bg-blue-700">OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
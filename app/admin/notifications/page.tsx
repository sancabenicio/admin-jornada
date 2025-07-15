'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ArrowLeft, Trash2 } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { NotificationType } from '@/types';

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useAdmin();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesRead = readFilter === 'all' || 
      (readFilter === 'read' && notification.isRead) || 
      (readFilter === 'unread' && !notification.isRead);
    return matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'ERROR':
        return '❌';
      case 'INFO':
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS':
        return 'border-l-green-500 bg-green-50';
      case 'WARNING':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'ERROR':
        return 'border-l-red-500 bg-red-50';
      case 'INFO':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS':
        return 'Sucesso';
      case 'WARNING':
        return 'Aviso';
      case 'ERROR':
        return 'Erro';
      case 'INFO':
        return 'Informação';
      default:
        return 'Info';
    }
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Todas as notificações foram lidas'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllNotificationsAsRead}
            variant="outline"
            className="text-blue-600 hover:text-blue-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="SUCCESS">Sucesso</SelectItem>
              <SelectItem value="WARNING">Aviso</SelectItem>
              <SelectItem value="ERROR">Erro</SelectItem>
              <SelectItem value="INFO">Informação</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Não lidas</SelectItem>
              <SelectItem value="read">Lidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-slate-400 mb-4">
                <div className="text-6xl mb-4">🔔</div>
                <p className="text-lg font-medium text-slate-600">Nenhuma notificação encontrada</p>
                <p className="text-sm text-slate-500 mt-2">
                  {typeFilter !== 'all' || readFilter !== 'all' 
                    ? 'Tente ajustar os filtros para ver mais notificações'
                    : 'Você está em dia com suas notificações!'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.isRead ? getNotificationColor(notification.type) : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {notification.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.isRead && (
                          <Badge className="h-2 w-2 rounded-full bg-blue-500 p-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-slate-600 mb-3 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-sm text-slate-400">
                      {new Date(notification.createdAt).toLocaleString('pt-PT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-green-600 hover:text-green-700"
                        title="Marcar como lida"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Eliminar notificação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{notifications.length}</div>
              <div className="text-sm text-slate-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
              <div className="text-sm text-slate-600">Não lidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.type === 'SUCCESS').length}
              </div>
              <div className="text-sm text-slate-600">Sucessos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {notifications.filter(n => n.type === 'ERROR').length}
              </div>
              <div className="text-sm text-slate-600">Erros</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
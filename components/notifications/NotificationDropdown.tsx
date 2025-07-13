'use client';

import React, { useState } from 'react';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import { NotificationType } from '@/types';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAdmin();

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const recentNotifications = notifications.slice(0, 5);

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

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-500 hover:text-slate-700"
      >
        <Bell className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 shadow-xl border-slate-200 animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notificações</CardTitle>
                {unreadNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50 ${
                        !notification.isRead ? getNotificationColor(notification.type) : 'border-l-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                            <h4 className="text-sm font-medium text-slate-900">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <Badge className="h-2 w-2 rounded-full bg-blue-500 p-0" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(notification.createdAt).toLocaleString('pt-PT')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markNotificationAsRead(notification.id)}
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {notifications.length > 5 && (
                <div className="p-3 border-t border-slate-200 bg-slate-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-blue-600 hover:text-blue-700"
                  >
                    Ver todas as notificações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AccessDenied } from './AccessDenied';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ 
  children, 
  fallback,
  showAccessDenied = true
}) => {
  const { isLoading, isAuthorized } = useAuth();

  // Mostrar loading enquanto verifica autorização
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">A verificar autorização...</p>
        </div>
      </div>
    );
  }

  // Se não está autorizado, mostrar fallback ou AccessDenied
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showAccessDenied) {
      return <AccessDenied />;
    }
    return null; // O redirecionamento será feito pelo hook
  }

  // Se está autorizado, mostrar o conteúdo
  return <>{children}</>;
}; 
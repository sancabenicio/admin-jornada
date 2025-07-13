'use client';

import React from 'react';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/layout/AdminLayout';
import LoginForm from '@/components/auth/LoginForm';

function AdminContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useAdmin();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminContent>{children}</AdminContent>
    </AdminProvider>
  );
}
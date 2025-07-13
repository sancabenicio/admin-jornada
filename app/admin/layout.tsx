'use client';

import React from 'react';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/layout/AdminLayout';
import LoginForm from '@/components/auth/LoginForm';

function AdminContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdmin();

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
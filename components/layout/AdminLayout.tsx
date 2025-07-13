'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  Mail, 
  FileText, 
  BarChart3, 
  Menu, 
  X,
  LogOut,
  Settings,
  Bell,
  User,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/contexts/AdminContext';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Cursos', href: '/admin/courses', icon: BookOpen },
  { name: 'Candidatos', href: '/admin/candidates', icon: Users },
  { name: 'Comunicação', href: '/admin/communication', icon: Mail },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const pathname = usePathname();
  const { setIsAuthenticated, notifications, adminProfile, globalSearch, setGlobalSearch } = useAdmin();

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-2xl animate-slide-in">
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <img src="/logo-jornada.png" alt="Logo Coração da Jornada" className="h-8 w-8 object-contain" />
              <h2 className="text-lg font-bold text-slate-900">Admin</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex ${sidebarMinimized ? 'lg:w-20' : 'lg:w-72'} lg:flex-col transition-all duration-200`}>
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-slate-200 shadow-sm">
          <div className="flex flex-1 flex-col overflow-y-auto pt-8 pb-4">
            <div className="flex items-center flex-shrink-0 px-6 mb-8 justify-between">
              <div className={`flex items-center space-x-3`}>
                <img src="/logo-jornada.png" alt="Logo Coração da Jornada" className="h-10 w-10 object-contain" />
                {!sidebarMinimized && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Coração da Jornada</h2>
                    <p className="text-sm text-slate-500">Painel Administrativo</p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarMinimized((v) => !v)}
                className="text-slate-500 hover:text-slate-700"
              >
                {sidebarMinimized ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            </div>
            <nav className="mt-2 flex-1 space-y-2 px-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    } ${sidebarMinimized ? 'justify-center px-2' : ''}`}
                  >
                    <item.icon className={`mr-0 ${sidebarMinimized ? 'h-6 w-6' : 'mr-3 h-5 w-5'} flex-shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                    }`} />
                    {!sidebarMinimized && item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 border-t border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                  {adminProfile?.avatar ? (
                    <img src={adminProfile.avatar} alt="Avatar" className="h-10 w-10 object-cover rounded-full" />
                  ) : (
                    <User className="h-5 w-5 text-slate-600" />
                  )}
                </div>
              </div>
              {!sidebarMinimized && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {adminProfile?.name || 'Administrador'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {adminProfile?.role || 'Admin'}
                  </p>
                </div>
              )}
              {!sidebarMinimized && (
                <Link href="/admin/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
            {!sidebarMinimized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full mt-3 text-slate-500 hover:text-slate-700 justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Terminar Sessão
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={sidebarMinimized ? 'lg:pl-20' : 'lg:pl-72'}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-700"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Search bar - hidden on mobile */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar..."
                  className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white"
                  value={globalSearch}
                  onChange={e => setGlobalSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <NotificationDropdown />
                {unreadNotifications > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0"
                  >
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </div>

              {/* Profile - mobile */}
              <div className="lg:hidden">
                <Link href="/admin/profile">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Logout - mobile */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 lg:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
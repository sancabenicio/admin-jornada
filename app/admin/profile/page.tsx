'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, Shield, Camera, Save, Key } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { uploadImageToCloudinary } from '@/lib/services/cloudinary.service';
import { profileService } from '@/lib/services/profile.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ProfilePage() {
  const { adminProfile, updateAdminProfile } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: adminProfile?.name || '',
    email: adminProfile?.email || '',
    phone: adminProfile?.phone || '',
    department: adminProfile?.department || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Update form data when adminProfile is loaded
  useEffect(() => {
    if (adminProfile) {
      setFormData({
        name: adminProfile.name || '',
        email: adminProfile.email || '',
        phone: adminProfile.phone || '',
        department: adminProfile.department || '',
      });
    }
  }, [adminProfile]);

  const handleSaveProfile = () => {
    updateAdminProfile(formData);
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As palavras-passe não coincidem');
      return;
    }
    setPasswordLoading(true);
    try {
      await profileService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao alterar palavra-passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Mostrar preview temporário
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          updateAdminProfile({ avatar: imageUrl });
        };
        reader.readAsDataURL(file);
        
        // Upload para Cloudinary
        const cloudinaryUrl = await uploadImageToCloudinary(file);
        updateAdminProfile({ avatar: cloudinaryUrl });
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Perfil</h1>
        <p className="text-slate-600 mt-2">Gerir informações da conta e preferências</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto mb-4">
              <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                {adminProfile?.avatar ? (
                  <img
                    src={adminProfile.avatar}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <Camera className="h-4 w-4 text-slate-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload avatar"
                />
              </label>
            </div>
            <CardTitle className="text-xl">{adminProfile?.name || 'Carregando...'}</CardTitle>
            <CardDescription>{adminProfile?.email || 'carregando@email.com'}</CardDescription>
            <Badge className="mx-auto mt-2 bg-blue-100 text-blue-800">
              {adminProfile?.role || 'Admin'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">
                Membro desde {adminProfile?.joinedAt ? new Date(adminProfile.joinedAt).toLocaleDateString('pt-PT') : 'Carregando...'}
              </span>
            </div>
            {adminProfile?.lastLogin && (
              <div className="flex items-center space-x-3 text-sm">
                <Shield className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">
                  Último acesso: {new Date(adminProfile.lastLogin).toLocaleDateString('pt-PT')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configurações da Conta</CardTitle>
            <CardDescription>
              Atualize as suas informações pessoais e preferências de segurança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Informações Pessoais</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Número de telefone"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Departamento"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Alterações
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Palavra-passe Atual</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="pl-10"
                        placeholder="Digite a palavra-passe atual"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Palavra-passe</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="pl-10"
                        placeholder="Digite a nova palavra-passe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Palavra-passe</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10"
                        placeholder="Confirme a nova palavra-passe"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordLoading}
                  >
                    {passwordLoading ? 'A alterar...' : 'Alterar Palavra-passe'}
                  </Button>
                </div>
                <Dialog open={passwordSuccess} onOpenChange={setPasswordSuccess}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Palavra-passe alterada</DialogTitle>
                    </DialogHeader>
                    <div className="text-green-700 text-lg font-semibold py-4 text-center">
                      Palavra-passe alterada com sucesso!
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={() => setPasswordSuccess(false)} className="bg-blue-600 hover:bg-blue-700">OK</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
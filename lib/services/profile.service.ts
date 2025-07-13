import { AdminProfile } from '@/types';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  department?: string;
  avatar?: string;
}

class ProfileService {
  private baseUrl = '/api/admin/profile';

  async getProfile(): Promise<AdminProfile> {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      throw new Error('Usuário não autenticado');
    }

    const user = JSON.parse(userData);
    const response = await fetch(`${this.baseUrl}?userId=${user.id}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar perfil');
    }

    return response.json();
  }

  async updateProfile(data: UpdateProfileData): Promise<AdminProfile> {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    if (!userData) {
      throw new Error('Usuário não autenticado');
    }

    const user = JSON.parse(userData);
    const response = await fetch(`${this.baseUrl}?userId=${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar perfil');
    }

    return response.json();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      throw new Error('Usuário não autenticado');
    }
    const user = JSON.parse(userData);
    const response = await fetch(`${this.baseUrl}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        currentPassword,
        newPassword
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao alterar senha');
    }
  }
}

export const profileService = new ProfileService(); 
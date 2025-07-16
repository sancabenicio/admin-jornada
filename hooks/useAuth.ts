import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          setIsAuthorized(false);
          setUser(null);
          return;
        }

        const parsedUser = JSON.parse(userData);
        
        // Verificar se o utilizador tem role ADMIN
        if (parsedUser.role !== 'ADMIN') {
          localStorage.removeItem('userData');
          setIsAuthorized(false);
          setUser(null);
          return;
        }

        setUser(parsedUser);
        setIsAuthorized(true);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('userData');
        setIsAuthorized(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthorized(false);
    router.push('/admin');
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthorized) {
      router.push('/admin');
      return false;
    }
    return true;
  };

  return {
    user,
    isLoading,
    isAuthorized,
    logout,
    requireAuth
  };
}; 
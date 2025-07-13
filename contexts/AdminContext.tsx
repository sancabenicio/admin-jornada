'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Candidate, BlogPost, EmailTemplate, DashboardStats, CourseStatus, CandidateStatus, Notification, AdminProfile } from '@/types';

interface AdminContextType {
  // Courses
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'candidatesCount' | 'acceptedCount'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  // Candidates
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'appliedAt'>) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  
  // Blog
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  
  // Email Templates
  emailTemplates: EmailTemplate[];
  
  // Dashboard
  dashboardStats: DashboardStats;
  
  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  
  // Admin Profile
  adminProfile: AdminProfile;
  updateAdminProfile: (updates: Partial<AdminProfile>) => void;
  
  // Auth
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    id: '1',
    name: 'Administrador',
    email: 'admin@coracaodajornada.pt',
    role: 'Administrador Principal',
    department: 'Gestão',
    joinedAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock data initialization
  useEffect(() => {
    // Initialize with mock data
    setCourses([
      {
        id: '1',
        name: 'Edição de Vídeo',
        description: 'Curso completo de edição de vídeo profissional. Aprenda a usar as principais ferramentas do mercado.',
        duration: '320 horas (16 semanas)',
        startDate: '2024-02-01',
        endDate: '2024-05-31',
        maxStudents: 25,
        applicationLimit: 50,
        status: 'Aberto',
        candidatesCount: 12,
        acceptedCount: 8,
        createdAt: '2024-01-15T10:00:00Z',
        image: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=1200',
        price: 1200,
        location: 'Online + Presencial (Lisboa)'
      },
      {
        id: '2',
        name: 'Auxiliar de Farmácia ( Ter equivalência português)',
        description: 'Formação para auxiliar de farmácia com equivalência em Portugal. Aprenda sobre medicamentos, atendimento e legislação.',
        duration: '240 horas (12 semanas)',
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        maxStudents: 20,
        applicationLimit: 40,
        status: 'Em Curso',
        candidatesCount: 18,
        acceptedCount: 15,
        createdAt: '2024-01-10T10:00:00Z',
        image: 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=1200',
        price: 950,
        location: 'Online'
      },
      {
        id: '3',
        name: 'Treinador de Futebol',
        description: 'Formação para treinador de futebol. Aprenda táticas, metodologias de treino e gestão de equipas.',
        duration: '180 horas (9 semanas)',
        startDate: '2024-04-01',
        endDate: '2024-06-15',
        maxStudents: 30,
        applicationLimit: 60,
        status: 'Aberto',
        candidatesCount: 8,
        acceptedCount: 5,
        createdAt: '2024-01-20T10:00:00Z',
        image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200',
        price: 750,
        location: 'Híbrido (Porto)'
      },
      {
        id: '4',
        name: 'Marketing',
        description: 'Curso de marketing estratégico e digital. Aprenda a criar campanhas eficazes e aumentar vendas.',
        duration: '200 horas (10 semanas)',
        startDate: '2024-05-01',
        endDate: '2024-07-15',
        maxStudents: 25,
        applicationLimit: 50,
        status: 'Aberto',
        candidatesCount: 5,
        acceptedCount: 3,
        createdAt: '2024-01-25T10:00:00Z',
        image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1200',
        price: 850,
        location: 'Online'
      },
      {
        id: '5',
        name: 'Comércio',
        description: 'Formação em técnicas de vendas, atendimento ao cliente e gestão comercial.',
        duration: '160 horas (8 semanas)',
        startDate: '2024-06-01',
        endDate: '2024-07-31',
        maxStudents: 30,
        applicationLimit: 60,
        status: 'Aberto',
        candidatesCount: 3,
        acceptedCount: 2,
        createdAt: '2024-01-30T10:00:00Z',
        image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1200',
        price: 650,
        location: 'Presencial (Lisboa)'
      }
    ]);

    setCandidates([
      {
        id: '1',
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        country: 'Portugal',
        contact: '912345678',
        courseId: '1',
        courseName: 'Edição de Vídeo',
        status: 'Aceite',
        appliedAt: '2024-01-20T10:00:00Z',
        documentType: 'Três Certificados ( 10º, 11º e 12º ano.)',
        documents: ['certificado_10ano.pdf', 'certificado_11ano.pdf', 'certificado_12ano.pdf']
      },
      {
        id: '2',
        name: 'João Santos',
        email: 'joao.santos@email.com',
        country: 'Brasil',
        contact: '+55 11 98765-4321',
        courseId: '1',
        courseName: 'Edição de Vídeo',
        status: 'Inscrito',
        appliedAt: '2024-01-22T14:30:00Z',
        documentType: 'Passaporte',
        documents: ['passaporte.pdf']
      },
      {
        id: '3',
        name: 'Maria Costa',
        email: 'maria.costa@email.com',
        country: 'Angola',
        contact: '+244 923 456 789',
        courseId: '2',
        courseName: 'Auxiliar de Farmácia ( Ter equivalência português)',
        status: 'Em Formação',
        appliedAt: '2024-01-18T09:15:00Z',
        documentType: 'Três Certificados ( 10º, 11º e 12º ano.)',
        documents: ['certificados_completos.pdf']
      }
    ]);

    setBlogPosts([
      {
        id: '1',
        title: 'Como Escolher o Curso Certo para a Sua Carreira',
        content: 'Escolher o curso de formação adequado é uma decisão crucial que pode definir o rumo da sua carreira profissional. Neste artigo, exploramos os principais fatores a considerar...',
        excerpt: 'Descubra como escolher o curso de formação que melhor se adapta aos seus objetivos profissionais e pessoais.',
        coverImage: 'https://images.pexels.com/photos/7988079/pexels-photo-7988079.jpeg?auto=compress&cs=tinysrgb&w=1200',
        tags: ['Carreira', 'Formação', 'Desenvolvimento'],
        category: 'Carreira',
        status: 'Publicado',
        publishedAt: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        author: 'Equipa Coração da Jornada',
        readTime: 5
      },
      {
        id: '2',
        title: 'Tendências do Mercado de Trabalho em 2024',
        content: 'O mercado de trabalho está em constante evolução, especialmente na área da tecnologia. Analisamos as principais tendências para 2024...',
        excerpt: 'Conheça as profissões em alta e as competências mais procuradas pelas empresas em 2024.',
        coverImage: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200',
        tags: ['Mercado', 'Tecnologia', 'Futuro'],
        category: 'Mercado de Trabalho',
        status: 'Publicado',
        publishedAt: '2024-01-20T14:00:00Z',
        createdAt: '2024-01-20T14:00:00Z',
        updatedAt: '2024-01-20T14:00:00Z',
        author: 'Equipa Coração da Jornada',
        readTime: 7
      }
    ]);

    setNotifications([
      {
        id: '1',
        type: 'info',
        title: 'Nova candidatura recebida',
        message: 'João Santos candidatou-se ao curso de Desenvolvimento Web Full Stack',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/admin/candidates'
      },
      {
        id: '2',
        type: 'success',
        title: 'Curso publicado com sucesso',
        message: 'O curso "Marketing Digital" foi publicado e está disponível para candidaturas',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/admin/courses'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Limite de candidaturas próximo',
        message: 'O curso "Design UX/UI" está próximo do limite de candidaturas (35/40)',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionUrl: '/admin/courses'
      }
    ]);
  }, []);

  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt' | 'candidatesCount' | 'acceptedCount'>) => {
    const newCourse: Course = {
      ...courseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      candidatesCount: 0,
      acceptedCount: 0
    };
    setCourses(prev => [...prev, newCourse]);
    
    addNotification({
      type: 'success',
      title: 'Curso criado',
      message: `O curso "${courseData.name}" foi criado com sucesso`,
      read: false
    });
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(course => 
      course.id === id ? { ...course, ...updates } : course
    ));
    
    addNotification({
      type: 'info',
      title: 'Curso atualizado',
      message: `As informações do curso foram atualizadas`,
      read: false
    });
  };

  const deleteCourse = (id: string) => {
    const course = courses.find(c => c.id === id);
    setCourses(prev => prev.filter(course => course.id !== id));
    setCandidates(prev => prev.filter(candidate => candidate.courseId !== id));
    
    if (course) {
      addNotification({
        type: 'warning',
        title: 'Curso eliminado',
        message: `O curso "${course.name}" foi eliminado`,
        read: false
      });
    }
  };

  const addCandidate = (candidateData: Omit<Candidate, 'id' | 'appliedAt'>) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: Date.now().toString(),
      appliedAt: new Date().toISOString()
    };
    setCandidates(prev => [...prev, newCandidate]);
    
    // Update course candidates count
    setCourses(prev => prev.map(course => 
      course.id === candidateData.courseId 
        ? { ...course, candidatesCount: course.candidatesCount + 1 }
        : course
    ));
    
    addNotification({
      type: 'info',
      title: 'Nova candidatura',
      message: `${candidateData.name} candidatou-se ao curso ${candidateData.courseName}`,
      read: false,
      actionUrl: '/admin/candidates'
    });
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    const oldCandidate = candidates.find(c => c.id === id);
    setCandidates(prev => prev.map(candidate => 
      candidate.id === id ? { ...candidate, ...updates } : candidate
    ));
    
    // Update course accepted count if status changed to Aceite
    if (updates.status === 'Aceite' && oldCandidate?.status !== 'Aceite') {
      const candidate = candidates.find(c => c.id === id);
      if (candidate) {
        setCourses(prev => prev.map(course => 
          course.id === candidate.courseId 
            ? { ...course, acceptedCount: course.acceptedCount + 1 }
            : course
        ));
        
        addNotification({
          type: 'success',
          title: 'Candidato aceite',
          message: `${candidate.name} foi aceite no curso ${candidate.courseName}`,
          read: false
        });
      }
    }
  };

  const deleteCandidate = (id: string) => {
    const candidate = candidates.find(c => c.id === id);
    setCandidates(prev => prev.filter(c => c.id !== id));
    
    if (candidate) {
      setCourses(prev => prev.map(course => 
        course.id === candidate.courseId 
          ? { 
              ...course, 
              candidatesCount: course.candidatesCount - 1,
              acceptedCount: candidate.status === 'Aceite' ? course.acceptedCount - 1 : course.acceptedCount
            }
          : course
      ));
    }
  };

  const addBlogPost = (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPost: BlogPost = {
      ...postData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: adminProfile.name
    };
    setBlogPosts(prev => [...prev, newPost]);
    
    addNotification({
      type: 'success',
      title: 'Artigo criado',
      message: `O artigo "${postData.title}" foi ${postData.status === 'Publicado' ? 'publicado' : 'guardado como rascunho'}`,
      read: false
    });
  };

  const updateBlogPost = (id: string, updates: Partial<BlogPost>) => {
    setBlogPosts(prev => prev.map(post => 
      post.id === id ? { ...post, ...updates, updatedAt: new Date().toISOString() } : post
    ));
  };

  const deleteBlogPost = (id: string) => {
    const post = blogPosts.find(p => p.id === id);
    setBlogPosts(prev => prev.filter(post => post.id !== id));
    
    if (post) {
      addNotification({
        type: 'warning',
        title: 'Artigo eliminado',
        message: `O artigo "${post.title}" foi eliminado`,
        read: false
      });
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const updateAdminProfile = (updates: Partial<AdminProfile>) => {
    setAdminProfile(prev => ({ ...prev, ...updates }));
  };

  const emailTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Candidatura Aceite',
      subject: 'Candidatura Aceite - {{courseName}}',
      content: 'Olá {{candidateName}}, a sua candidatura para o curso {{courseName}} foi aceite! Parabéns e bem-vindo à nossa comunidade de aprendizagem.',
      variables: ['candidateName', 'courseName']
    },
    {
      id: '2',
      name: 'Candidatura Rejeitada',
      subject: 'Candidatura - {{courseName}}',
      content: 'Olá {{candidateName}}, infelizmente a sua candidatura para o curso {{courseName}} não foi aceite desta vez. Encorajamos a candidatar-se a futuros cursos.',
      variables: ['candidateName', 'courseName']
    },
    {
      id: '3',
      name: 'Início do Curso',
      subject: 'Início do Curso {{courseName}} - Informações Importantes',
      content: 'Olá {{candidateName}}, o curso {{courseName}} está prestes a começar! Aqui estão as informações importantes que precisa de saber...',
      variables: ['candidateName', 'courseName', 'startDate']
    }
  ];

  const dashboardStats: DashboardStats = {
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.status === 'Aberto' || c.status === 'Em Curso').length,
    totalCandidates: candidates.length,
    acceptedCandidates: candidates.filter(c => c.status === 'Aceite' || c.status === 'Em Formação').length,
    publishedPosts: blogPosts.filter(p => p.status === 'Publicado').length,
    pendingApplications: candidates.filter(c => c.status === 'Inscrito').length
  };

  return (
    <AdminContext.Provider value={{
      courses,
      setCourses,
      addCourse,
      updateCourse,
      deleteCourse,
      candidates,
      setCandidates,
      addCandidate,
      updateCandidate,
      deleteCandidate,
      blogPosts,
      setBlogPosts,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
      emailTemplates,
      dashboardStats,
      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      addNotification,
      adminProfile,
      updateAdminProfile,
      isAuthenticated,
      setIsAuthenticated
    }}>
      {children}
    </AdminContext.Provider>
  );
};
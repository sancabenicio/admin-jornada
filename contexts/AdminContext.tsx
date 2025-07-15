'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Candidate, BlogPost, EmailTemplate, DashboardStats, CourseStatus, CandidateStatus, Notification, AdminProfile } from '@/types';
import { candidateService, CreateCandidateData, UpdateCandidateData } from '@/lib/services/candidate.service';
import { courseService, CreateCourseData, UpdateCourseData } from '@/lib/services/course.service';
import { blogService, CreateBlogPostData, UpdateBlogPostData } from '@/lib/services/blog.service';
import { profileService, UpdateProfileData } from '@/lib/services/profile.service';

interface AdminContextType {
  // Courses
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  addCourse: (course: CreateCourseData) => Promise<void>;
  updateCourse: (id: string, updates: UpdateCourseData) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  loadCourses: () => Promise<void>;
  
  // Candidates
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  addCandidate: (candidate: CreateCandidateData) => Promise<void>;
  updateCandidate: (id: string, updates: UpdateCandidateData) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  loadCandidates: (filters?: { status?: string; courseId?: string; search?: string }) => Promise<void>;
  
  // Blog
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  addBlogPost: (post: CreateBlogPostData) => Promise<void>;
  updateBlogPost: (id: string, updates: UpdateBlogPostData) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  
  // Email Templates
  emailTemplates: EmailTemplate[];
  loadEmailTemplates: () => Promise<void>;
  addEmailTemplate: (template: Omit<EmailTemplate, 'id'>) => Promise<void>;
  deleteEmailTemplate: (id: string) => Promise<void>;
  
  // Dashboard
  dashboardStats: DashboardStats;
  
  // Notifications
  notifications: Notification[];
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addNotification: (notificationData: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  // Admin Profile
  adminProfile: AdminProfile | null;
  updateAdminProfile: (updates: UpdateProfileData) => Promise<void>;
  
  // Auth
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthLoading: boolean;
  
  // Loading states
  loading: {
    courses: boolean;
    candidates: boolean;
    profile: boolean;
  };

  // Global Search
  globalSearch: string;
  setGlobalSearch: React.Dispatch<React.SetStateAction<string>>;
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
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  
  // Initialize authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('userData');
    }
    return false;
  });
  
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [loading, setLoading] = useState({
    courses: false,
    candidates: false,
    profile: false
  });

  // Load initial data
  useEffect(() => {
    // Set auth loading to false after initial check
    setIsAuthLoading(false);
    
    loadCourses();
    loadCandidates();
    loadBlogPosts();
    loadEmailTemplates();
    loadNotifications();
    
    // Load admin profile if authenticated
    if (isAuthenticated) {
      loadAdminProfile();
    }
  }, [isAuthenticated]);

  const loadCourses = async () => {
    setLoading(prev => ({ ...prev, courses: true }));
    try {
      const coursesData = await courseService.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

  const loadCandidates = async (filters?: { status?: string; courseId?: string; search?: string }) => {
    setLoading(prev => ({ ...prev, candidates: true }));
    try {
      const candidatesData = await candidateService.getCandidates(filters);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
    } finally {
      setLoading(prev => ({ ...prev, candidates: false }));
    }
  };

  const addCourse = async (courseData: CreateCourseData) => {
    try {
      const newCourse = await courseService.createCourse(courseData);
      setCourses(prev => [newCourse, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar curso:', error);
      throw error;
    }
  };

  const updateCourse = async (id: string, updates: UpdateCourseData) => {
    try {
      const updatedCourse = await courseService.updateCourse(id, updates);
      setCourses(prev => prev.map(course => 
        course.id === id ? updatedCourse : course
      ));
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      throw error;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await courseService.deleteCourse(id);
      setCourses(prev => prev.filter(course => course.id !== id));
    } catch (error) {
      console.error('Erro ao eliminar curso:', error);
      throw error;
    }
  };

  const addCandidate = async (candidateData: CreateCandidateData) => {
    try {
      const newCandidate = await candidateService.createCandidate(candidateData);
      setCandidates(prev => [newCandidate, ...prev]);
      addNotification({
        type: 'SUCCESS',
        title: 'Nova candidatura',
        message: `O candidato "${newCandidate.name}" candidatou-se ao curso "${newCandidate.courseName}".`,
        isRead: false
      });
    } catch (error) {
      console.error('Erro ao adicionar candidato:', error);
      throw error;
    }
  };

  const updateCandidate = async (id: string, updates: UpdateCandidateData) => {
    try {
      const updatedCandidate = await candidateService.updateCandidate(id, updates);
      setCandidates(prev => prev.map(candidate => 
        candidate.id === id ? updatedCandidate : candidate
      ));
    } catch (error) {
      console.error('Erro ao atualizar candidato:', error);
      throw error;
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      await candidateService.deleteCandidate(id);
      setCandidates(prev => prev.filter(candidate => candidate.id !== id));
    } catch (error) {
      console.error('Erro ao eliminar candidato:', error);
      throw error;
    }
  };

  const loadBlogPosts = async () => {
    try {
      const postsData = await blogService.getPosts();
      setBlogPosts(postsData);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    }
  };

  const addBlogPost = async (postData: CreateBlogPostData) => {
    try {
      const newPost = await blogService.createPost(postData);
      setBlogPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar post:', error);
      throw error;
    }
  };

  const updateBlogPost = async (id: string, updates: UpdateBlogPostData) => {
    try {
      const updatedPost = await blogService.updatePost(id, updates);
      setBlogPosts(prev => prev.map(post => 
        post.id === id ? updatedPost : post
      ));
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      throw error;
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      await blogService.deletePost(id);
      setBlogPosts(prev => prev.filter(post => post.id !== id));
    } catch (error) {
      console.error('Erro ao eliminar post:', error);
      throw error;
    }
  };

  const loadEmailTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates');
      const data = await res.json();
      setEmailTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates de email:', error);
    }
  };

  const addEmailTemplate = async (template: Omit<EmailTemplate, 'id'>) => {
    try {
      const res = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!res.ok) throw new Error('Erro ao criar template');
      await loadEmailTemplates();
    } catch (error) {
      console.error('Erro ao criar template de email:', error);
      throw error;
    }
  };

  const deleteEmailTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/email-templates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao remover template');
      await loadEmailTemplates();
    } catch (error) {
      console.error('Erro ao remover template de email:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      // Marcar todas as notificações não lidas
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(notification =>
          fetch(`/api/notifications/${notification.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          })
        )
      );
      setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });
      if (response.ok) {
        const newNotification = await response.json();
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao adicionar notificação:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }
    } catch (error) {
      console.error('Erro ao eliminar notificação:', error);
    }
  };

  const loadAdminProfile = async () => {
    setLoading(prev => ({ ...prev, profile: true }));
    try {
      const profileData = await profileService.getProfile();
      setAdminProfile(profileData);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const updateAdminProfile = async (updates: UpdateProfileData) => {
    setLoading(prev => ({ ...prev, profile: true }));
    try {
      const updatedProfile = await profileService.updateProfile(updates);
      setAdminProfile(updatedProfile);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const value: AdminContextType = {
    courses,
    setCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    loadCourses,
    candidates,
    setCandidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    loadCandidates,
    blogPosts,
    setBlogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    emailTemplates,
    loadEmailTemplates,
    addEmailTemplate,
    deleteEmailTemplate,
    dashboardStats: {
      totalCandidates: candidates.length,
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length,
      acceptedCandidates: candidates.filter(c => c.status === 'ACCEPTED' || c.status === 'IN_TRAINING').length,
      totalBlogPosts: blogPosts.length,
      recentApplications: candidates.filter(c => 
        new Date(c.appliedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length
    },
    notifications,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
    deleteNotification,
    adminProfile,
    updateAdminProfile,
    isAuthenticated,
    setIsAuthenticated,
    isAuthLoading,
    loading,
    globalSearch,
    setGlobalSearch
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
export type CourseStatus = 'Aberto' | 'Fechado' | 'Em Curso' | 'Concluído';
export type CandidateStatus = 'Inscrito' | 'Aceite' | 'Em Formação' | 'Concluído' | 'Rejeitado';
export type BlogStatus = 'Rascunho' | 'Publicado';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  applicationLimit: number;
  status: CourseStatus;
  candidatesCount: number;
  acceptedCount: number;
  createdAt: string;
  image?: string;
  price?: number;
  location?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  country: string;
  contact: string;
  courseId: string;
  courseName: string;
  status: CandidateStatus;
  appliedAt: string;
  notes?: string;
  documentType?: string;
  documents?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  category: string;
  status: BlogStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  readTime?: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

export interface DashboardStats {
  totalCourses: number;
  activeCourses: number;
  totalCandidates: number;
  acceptedCandidates: number;
  publishedPosts: number;
  pendingApplications: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  department?: string;
  joinedAt: string;
  lastLogin?: string;
}
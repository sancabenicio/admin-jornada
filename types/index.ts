export type CourseStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'COMPLETED';
export type CandidateStatus = 'REGISTERED' | 'ACCEPTED' | 'IN_TRAINING' | 'COMPLETED' | 'REJECTED';
export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

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
  updatedAt: string;
  image?: string;
  price: number;
  location: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  country: string;
  phone: string;
  courseId: string;
  courseName: string;
  status: CandidateStatus;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  age?: number;
  education?: string;
  experience?: string;
  submittedDocument?: string;
  certificates: string[];
  passport?: string;
  attachments: string[];
  course?: {
    id: string;
    name: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  category: string;
  status: BlogStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  readTime: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'WELCOME' | 'ACCEPTANCE' | 'REJECTION' | 'REMINDER';
}

export interface DashboardStats {
  totalCourses: number;
  activeCourses: number;
  totalCandidates: number;
  acceptedCandidates: number;
  totalBlogPosts: number;
  recentApplications: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
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
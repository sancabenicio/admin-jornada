import { Course, CourseStatus } from '@/types';

export interface CreateCourseData {
  name: string;
  description: string;
  duration: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  applicationLimit: number;
  price: number;
  location: string;
  image?: string;
  status?: CourseStatus;
}

export interface UpdateCourseData {
  name?: string;
  description?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  applicationLimit?: number;
  price?: number;
  location?: string;
  image?: string;
  status?: CourseStatus;
}

export interface CourseFilters {
  status?: string;
  search?: string;
}

class CourseService {
  private baseUrl = '/api/courses';

  async getCourses(filters?: CourseFilters): Promise<Course[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar cursos');
    }

    return response.json();
  }

  async getCourse(id: string): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar curso');
    }

    return response.json();
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar curso');
    }

    return response.json();
  }

  async updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar curso');
    }

    return response.json();
  }

  async deleteCourse(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao eliminar curso');
    }
  }
}

export const courseService = new CourseService(); 
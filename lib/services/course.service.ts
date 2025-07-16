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
  private cache: Course[] | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 30 * 1000; // 30 segundos

  private canUseCache(): boolean {
    return this.cache !== null && (Date.now() - this.cacheTimestamp < this.CACHE_DURATION);
  }

  private updateCache(courses: Course[]) {
    this.cache = courses;
    this.cacheTimestamp = Date.now();
  }

  private invalidateCache() {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  async getCourses(filters?: CourseFilters): Promise<Course[]> {
    // Se não há filtros e temos cache válido, usar cache
    if (!filters && this.canUseCache()) {
      return this.cache!;
    }

    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar cursos');
    }

    const courses = await response.json();

    // Atualizar cache apenas se não há filtros
    if (!filters) {
      this.updateCache(courses);
    }

    return courses;
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

    const newCourse = await response.json();
    
    // Invalidar cache após criar curso
    this.invalidateCache();
    
    return newCourse;
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

    const updatedCourse = await response.json();
    
    // Invalidar cache após atualizar curso
    this.invalidateCache();
    
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao eliminar curso');
    }

    // Invalidar cache após eliminar curso
    this.invalidateCache();
  }

  // Método para forçar refresh do cache
  async refreshCourses(): Promise<Course[]> {
    this.invalidateCache();
    return this.getCourses();
  }
}

export const courseService = new CourseService(); 
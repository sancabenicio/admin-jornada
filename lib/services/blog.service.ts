import { BlogPost, BlogStatus } from '@/types';

export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  category: string;
  status?: BlogStatus;
  author: string;
  readTime: number;
}

export interface UpdateBlogPostData {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  category?: string;
  status?: BlogStatus;
  author?: string;
  readTime?: number;
}

export interface BlogFilters {
  status?: string;
  category?: string;
  search?: string;
}

class BlogService {
  private baseUrl = '/api/blog';

  async getPosts(filters?: BlogFilters): Promise<BlogPost[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar posts');
    }

    return response.json();
  }

  async getPost(id: string): Promise<BlogPost> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar post');
    }

    return response.json();
  }

  async createPost(data: CreateBlogPostData): Promise<BlogPost> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar post');
    }

    return response.json();
  }

  async updatePost(id: string, data: UpdateBlogPostData): Promise<BlogPost> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar post');
    }

    return response.json();
  }

  async deletePost(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao eliminar post');
    }
  }
}

export const blogService = new BlogService(); 
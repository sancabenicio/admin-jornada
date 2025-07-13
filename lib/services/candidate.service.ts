import { Candidate, CandidateStatus } from '@/types';

export interface CreateCandidateData {
  name: string;
  email: string;
  country: string;
  phone: string;
  age?: number;
  education?: string;
  experience?: string;
  notes?: string;
  courseId: string;
  status?: CandidateStatus;
  submittedDocument?: string;
  certificates?: string[];
  passport?: string;
  attachments?: string[];
}

export interface UpdateCandidateData {
  name?: string;
  email?: string;
  country?: string;
  phone?: string;
  age?: number;
  education?: string;
  experience?: string;
  notes?: string;
  courseId?: string;
  status?: CandidateStatus;
  submittedDocument?: string;
  certificates?: string[];
  passport?: string;
  attachments?: string[];
}

export interface CandidateFilters {
  status?: string;
  courseId?: string;
  search?: string;
}

class CandidateService {
  private baseUrl = '/api/candidates';

  async getCandidates(filters?: CandidateFilters): Promise<Candidate[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar candidatos');
    }

    return response.json();
  }

  async getCandidate(id: string): Promise<Candidate> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar candidato');
    }

    return response.json();
  }

  async createCandidate(data: CreateCandidateData): Promise<Candidate> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar candidato');
    }

    return response.json();
  }

  async updateCandidate(id: string, data: UpdateCandidateData): Promise<Candidate> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar candidato');
    }

    return response.json();
  }

  async deleteCandidate(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao eliminar candidato');
    }
  }

  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    return this.updateCandidate(id, { status });
  }
}

export const candidateService = new CandidateService(); 
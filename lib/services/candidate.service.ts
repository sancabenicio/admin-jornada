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
  private cache: Candidate[] | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 30 * 1000; // 30 segundos

  private canUseCache(): boolean {
    return this.cache !== null && (Date.now() - this.cacheTimestamp < this.CACHE_DURATION);
  }

  private updateCache(candidates: Candidate[]) {
    this.cache = candidates;
    this.cacheTimestamp = Date.now();
  }

  private invalidateCache() {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  async getCandidates(filters?: CandidateFilters): Promise<Candidate[]> {
    // Se não há filtros e temos cache válido, usar cache
    if (!filters && this.canUseCache()) {
      return this.cache!;
    }

    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar candidatos');
    }

    const candidates = await response.json();

    // Atualizar cache apenas se não há filtros
    if (!filters) {
      this.updateCache(candidates);
    }

    return candidates;
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

    const newCandidate = await response.json();
    
    // Invalidar cache após criar candidato
    this.invalidateCache();
    
    return newCandidate;
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

    const updatedCandidate = await response.json();
    
    // Invalidar cache após atualizar candidato
    this.invalidateCache();
    
    return updatedCandidate;
  }

  async deleteCandidate(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao eliminar candidato');
    }

    // Invalidar cache após eliminar candidato
    this.invalidateCache();
  }

  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    return this.updateCandidate(id, { status });
  }

  // Método para forçar refresh do cache
  async refreshCandidates(): Promise<Candidate[]> {
    this.invalidateCache();
    return this.getCandidates();
  }
}

export const candidateService = new CandidateService(); 
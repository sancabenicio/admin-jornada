export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Tradução dos status dos cursos
export function translateCourseStatus(status: string): string {
  switch (status) {
    case 'OPEN':
      return 'Aberto';
    case 'IN_PROGRESS':
      return 'Em andamento';
    case 'CLOSED':
      return 'Fechado';
    case 'COMPLETED':
      return 'Concluído';
    default:
      return status;
  }
}

// Tradução dos status dos candidatos
export function translateCandidateStatus(status: string): string {
  switch (status) {
    case 'REGISTERED':
      return 'Registado';
    case 'ACCEPTED':
      return 'Aceite';
    case 'IN_TRAINING':
      return 'Em formação';
    case 'COMPLETED':
      return 'Concluído';
    case 'REJECTED':
      return 'Rejeitado';
    default:
      return status;
  }
}

// Tradução dos status dos posts do blog
export function translateBlogStatus(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'Rascunho';
    case 'PUBLISHED':
      return 'Publicado';
    case 'ARCHIVED':
      return 'Arquivado';
    default:
      return status;
  }
}

// Função genérica para traduzir qualquer status
export function translateStatus(status: string, type: 'course' | 'candidate' | 'blog'): string {
  switch (type) {
    case 'course':
      return translateCourseStatus(status);
    case 'candidate':
      return translateCandidateStatus(status);
    case 'blog':
      return translateBlogStatus(status);
    default:
      return status;
  }
}

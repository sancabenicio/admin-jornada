# Segurança e Autorização - Painel Administrativo

## Visão Geral

Este documento descreve as medidas de segurança implementadas para garantir que apenas utilizadores com role `ADMIN` tenham acesso ao painel administrativo e suas funcionalidades.

## Medidas de Segurança Implementadas

### 1. Verificação de Role no Login
- **Localização**: `components/auth/LoginForm.tsx`
- **Funcionalidade**: Após autenticação bem-sucedida, verifica se o utilizador tem role `ADMIN`
- **Comportamento**: Se não for admin, mostra erro "Acesso negado" e não permite login

### 2. Middleware de Proteção de Rotas
- **Localização**: `middleware.ts`
- **Funcionalidade**: Intercepta todas as requisições para rotas `/admin/*`
- **Comportamento**: 
  - Verifica se existe cookie `userData` com dados de utilizador
  - Valida se o role é `ADMIN`
  - Redireciona para `/admin` se não autorizado
  - Limpa cookies inválidos

### 3. Layout Admin com Verificação de Autorização
- **Localização**: `components/layout/AdminLayout.tsx`
- **Funcionalidade**: Verifica autorização em cada carregamento
- **Comportamento**:
  - Mostra loading enquanto verifica
  - Redireciona se não autorizado
  - Limpa dados locais se role inválido

### 4. Hook de Autenticação Personalizado
- **Localização**: `hooks/useAuth.ts`
- **Funcionalidade**: Hook reutilizável para verificar autenticação
- **Métodos**:
  - `isAuthorized`: Estado de autorização
  - `isLoading`: Estado de carregamento
  - `logout`: Função para terminar sessão
  - `requireAuth`: Função para verificar autorização

### 5. Componente AdminGuard
- **Localização**: `components/auth/AdminGuard.tsx`
- **Funcionalidade**: Wrapper para proteger componentes/páginas
- **Uso**: Envolve conteúdo que requer autorização admin
- **Comportamento**: Mostra loading, erro de acesso ou conteúdo protegido

### 6. Componente AccessDenied
- **Localização**: `components/auth/AccessDenied.tsx`
- **Funcionalidade**: Página de erro para acesso negado
- **Características**: Interface amigável com opções de navegação

## Como Usar

### Proteger uma Página Individual
```tsx
import { AdminGuard } from '@/components/auth/AdminGuard';

function MinhaPaginaContent() {
  // Conteúdo da página
}

export default function MinhaPagina() {
  return (
    <AdminGuard>
      <MinhaPaginaContent />
    </AdminGuard>
  );
}
```

### Usar o Hook de Autenticação
```tsx
import { useAuth } from '@/hooks/useAuth';

function MeuComponente() {
  const { user, isAuthorized, isLoading, logout } = useAuth();
  
  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthorized) return <div>Acesso negado</div>;
  
  return <div>Conteúdo protegido</div>;
}
```

## Fluxo de Segurança

1. **Login**: Utilizador tenta fazer login
2. **Verificação de Role**: Sistema verifica se tem role `ADMIN`
3. **Armazenamento**: Se autorizado, salva dados em localStorage e cookie
4. **Middleware**: Intercepta requisições e valida autorização
5. **Layout**: Verifica autorização em cada carregamento
6. **Componentes**: AdminGuard protege conteúdo específico

## Pontos de Verificação

- ✅ Login verifica role ADMIN
- ✅ Middleware protege rotas admin
- ✅ Layout verifica autorização
- ✅ Hook de autenticação disponível
- ✅ Componente AdminGuard implementado
- ✅ Página de acesso negado criada
- ✅ Logout limpa todos os dados

## Considerações de Segurança

1. **Frontend Only**: Esta implementação é apenas para frontend
2. **Backend Validation**: APIs devem ter validação adicional no backend
3. **HTTPS**: Recomenda-se usar HTTPS em produção
4. **Session Management**: Considerar implementar refresh tokens
5. **Rate Limiting**: Implementar rate limiting nas APIs de login

## Próximos Passos

1. Implementar validação de role nas APIs backend
2. Adicionar refresh tokens para sessões mais seguras
3. Implementar rate limiting
4. Adicionar logs de auditoria para ações administrativas
5. Considerar implementar 2FA para admins 
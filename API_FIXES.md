# Correções das APIs Públicas

## Problema Identificado

O frontend público em `/Users/beniciodecosanca/coracao-jornada` não conseguia aceder às APIs de cursos, blog e candidaturas devido a restrições de CORS e middleware.

## Soluções Implementadas

### 1. Middleware Atualizado
- **Arquivo**: `middleware.ts`
- **Mudança**: Permitir acesso público a APIs específicas
- **APIs Públicas**:
  - `/api/courses` - Listagem de cursos
  - `/api/blog` - Posts do blog
  - `/api/candidates` - Candidaturas
  - `/api/cloudinary/*` - Upload de imagens
  - `/api/test` - Teste de conectividade
  - `/api/debug/*` - Endpoints de debug

### 2. Headers CORS Configurados
- **Arquivo**: `next.config.js`
- **Mudança**: Adicionar headers CORS para todas as rotas da API
- **Headers**:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`

### 3. Suporte OPTIONS Adicionado
- **Arquivos**: 
  - `app/api/courses/route.ts`
  - `app/api/blog/route.ts`
  - `app/api/candidates/route.ts`
- **Mudança**: Adicionar função OPTIONS para preflight requests

### 4. Endpoint de Teste Criado
- **Arquivo**: `app/api/test/route.ts`
- **Função**: Verificar se a API está funcionando
- **URL**: `http://localhost:3000/api/test`

### 5. Endpoint de Debug Criado
- **Arquivo**: `app/api/debug/courses/route.ts`
- **Função**: Debug detalhado da API de cursos
- **URL**: `http://localhost:3000/api/debug/courses`

## Como Testar

### 1. Teste de Conectividade
```bash
curl http://localhost:3000/api/test
```

### 2. Teste de Cursos
```bash
curl http://localhost:3000/api/courses?status=OPEN
```

### 3. Teste de Debug
```bash
curl http://localhost:3000/api/debug/courses?status=OPEN
```

### 4. Teste no Browser
```javascript
// No console do browser
fetch('http://localhost:3000/api/test')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

## Configuração do Frontend Público

### 1. Variável de Ambiente
No frontend público, certifique-se de que está configurado:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Teste no courseService.ts
```javascript
// Adicionar logs para debug
console.log('API URL:', API_BASE_URL);
console.log('Request URL:', `${API_BASE_URL}/courses?status=OPEN`);
```

## Fluxo de Autorização

### APIs Públicas (Sem Autenticação)
- ✅ `/api/courses` - GET, POST
- ✅ `/api/blog` - GET, POST  
- ✅ `/api/candidates` - GET, POST
- ✅ `/api/cloudinary/*` - POST
- ✅ `/api/test` - GET
- ✅ `/api/debug/*` - GET

### APIs Protegidas (Apenas Admin)
- 🔒 `/api/admin/*` - Todas as rotas admin
- 🔒 Páginas `/admin/*` - Todas as páginas admin

## Logs Úteis

### No Servidor
```bash
# Verificar logs do Next.js
npm run dev

# Verificar logs específicos
grep "Debug:" logs.txt
```

### No Frontend
```javascript
// Adicionar no courseService.ts
console.log('Response status:', response.status);
console.log('Response headers:', response.headers);
console.log('Response data:', data);
```

## Próximos Passos

1. **Testar APIs**: Verificar se todas as APIs estão funcionando
2. **Verificar CORS**: Confirmar que não há erros de CORS
3. **Testar Frontend**: Verificar se o frontend público consegue aceder
4. **Monitorizar Logs**: Acompanhar logs para identificar problemas
5. **Otimizar Performance**: Implementar cache se necessário

## Troubleshooting

### Erro: "Failed to fetch"
- Verificar se o servidor está rodando
- Verificar se a URL está correta
- Verificar se não há firewall

### Erro: "CORS policy"
- Verificar headers no `next.config.js`
- Verificar middleware
- Verificar se a origem está permitida

### Erro: "404 Not Found"
- Verificar se a rota existe
- Verificar se o middleware não está bloqueando
- Verificar se o arquivo está no local correto 
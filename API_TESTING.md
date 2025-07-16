# Teste das APIs Públicas

## Visão Geral

Este documento explica como testar as APIs públicas que estão disponíveis para o frontend público em `/Users/beniciodecosanca/coracao-jornada`.

## APIs Públicas Disponíveis

### 1. Teste de Conectividade
```bash
curl http://localhost:3000/api/test
```

### 2. Listagem de Cursos
```bash
# Todos os cursos
curl http://localhost:3000/api/courses

# Apenas cursos abertos
curl http://localhost:3000/api/courses?status=OPEN

# Pesquisar cursos
curl "http://localhost:3000/api/courses?search=javascript"
```

### 3. Listagem de Posts do Blog
```bash
# Todos os posts
curl http://localhost:3000/api/blog

# Posts publicados
curl http://localhost:3000/api/blog?status=PUBLISHED

# Posts por categoria
curl http://localhost:3000/api/blog?category=tecnologia
```

### 4. Candidaturas
```bash
# Listar candidaturas (apenas para admin, mas endpoint público)
curl http://localhost:3000/api/candidates

# Candidaturas por curso
curl http://localhost:3000/api/candidates?courseId=123

# Candidaturas por status
curl http://localhost:3000/api/candidates?status=REGISTERED
```

### 5. Upload de Imagens
```bash
# Teste do Cloudinary
curl http://localhost:3000/api/cloudinary/test
```

## Teste no Frontend Público

### 1. Verificar Configuração da API Base URL

No frontend público, verifique se a variável de ambiente está configurada:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Teste no Browser

Abra o DevTools (F12) e execute no console:

```javascript
// Teste de conectividade
fetch('http://localhost:3000/api/test')
  .then(response => response.json())
  .then(data => console.log('Teste:', data))
  .catch(error => console.error('Erro:', error));

// Teste de cursos
fetch('http://localhost:3000/api/courses?status=OPEN')
  .then(response => response.json())
  .then(data => console.log('Cursos:', data))
  .catch(error => console.error('Erro:', error));
```

### 3. Verificar Erros de CORS

Se houver erros de CORS, verifique:

1. Se o servidor está rodando na porta 3000
2. Se os headers CORS estão sendo aplicados
3. Se o middleware está permitindo acesso às APIs públicas

## Solução de Problemas

### Erro: "Failed to fetch"
- Verifique se o servidor está rodando
- Verifique se a URL da API está correta
- Verifique se não há firewall bloqueando

### Erro: "CORS policy"
- Verifique se os headers CORS estão configurados
- Verifique se o middleware está permitindo acesso
- Verifique se o `next.config.js` tem os headers corretos

### Erro: "404 Not Found"
- Verifique se a rota da API existe
- Verifique se o middleware não está bloqueando
- Verifique se o arquivo da API está no local correto

### Erro: "500 Internal Server Error"
- Verifique os logs do servidor
- Verifique se o banco de dados está conectado
- Verifique se as variáveis de ambiente estão configuradas

## Logs Úteis

### No Servidor (admin-jornada)
```bash
npm run dev
# Verificar logs de erro no terminal
```

### No Frontend Público
```javascript
// Adicionar logs no courseService.ts
console.log('API URL:', API_BASE_URL);
console.log('Response status:', response.status);
console.log('Response headers:', response.headers);
```

## Configuração de Desenvolvimento

### 1. Iniciar o Servidor Admin
```bash
cd admin-jornada
npm run dev
```

### 2. Iniciar o Frontend Público
```bash
cd coracao-jornada
npm run dev
```

### 3. Verificar URLs
- Admin: http://localhost:3000
- Frontend Público: http://localhost:5173 (ou porta configurada)
- API: http://localhost:3000/api

## Exemplo de Teste Completo

```bash
# 1. Testar conectividade
curl http://localhost:3000/api/test

# 2. Testar cursos
curl http://localhost:3000/api/courses

# 3. Testar blog
curl http://localhost:3000/api/blog

# 4. Testar candidaturas
curl http://localhost:3000/api/candidates

# 5. Testar com headers CORS
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3000/api/courses
``` 
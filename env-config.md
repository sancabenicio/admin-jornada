# Configuração do Arquivo .env

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

## Configuração Básica

```env
# ===========================================
# CONFIGURAÇÃO DA BASE DE DADOS
# ===========================================

# URL de conexão com PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/project6_db?schema=public"

# ===========================================
# NEXTAUTH (AUTENTICAÇÃO)
# ===========================================

# Chave secreta para NextAuth (gerar com: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-here-minimum-32-characters"

# URL da aplicação
NEXTAUTH_URL="http://localhost:3000"

# ===========================================
# CONFIGURAÇÃO DE EMAIL (RESEND)
# ===========================================

# Chave da API do Resend para envio de emails
RESEND_API_KEY="re_4kbVkAVP_LCMAPcLwdm3kSJtya7zr6N9H"

# ===========================================
# CONFIGURAÇÕES OPCIONAIS
# ===========================================

# Ambiente (development, production, test)
NODE_ENV="development"

# Porta do servidor (opcional, padrão: 3000)
PORT=3000
```

## Exemplos de Configuração

### PostgreSQL Local (padrão)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/project6_db?schema=public"
```

### PostgreSQL com Docker
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project6_db?schema=public"
```

### PostgreSQL na nuvem (Supabase)
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### PostgreSQL na nuvem (Railway)
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/[YOUR-DATABASE]"
```

## Como Gerar NEXTAUTH_SECRET

Execute no terminal:
```bash
openssl rand -base64 32
```

Ou use um gerador online de chaves secretas.

## Configuração do Resend para Email

O projeto agora usa o **Resend** para envio de emails, que é mais moderno e confiável que SMTP tradicional.

### Configuração do Domínio no Resend

1. **Acesse o dashboard do Resend**: https://resend.com/dashboard
2. **Adicione seu domínio**: jornada-porto.pt
3. **Configure os registros DNS** conforme instruções do Resend
4. **Use a chave da API** fornecida: `re_4kbVkAVP_LCMAPcLwdm3kSJtya7zr6N9H`

### Vantagens do Resend

- ✅ **Entrega confiável**: Taxa de entrega superior a 99%
- ✅ **Analytics**: Rastreamento de aberturas e cliques
- ✅ **Templates**: Suporte a templates HTML avançados
- ✅ **API moderna**: RESTful API com TypeScript
- ✅ **Webhooks**: Notificações em tempo real
- ✅ **Sem configuração SMTP**: Configuração simples

## Passos para Configurar

1. **Crie o arquivo `.env`** na raiz do projeto
2. **Copie o conteúdo** acima para o arquivo
3. **Substitua os valores** pelos seus dados reais:
   - `username`: seu usuário PostgreSQL
   - `password`: sua senha PostgreSQL
   - `project6_db`: nome da sua base de dados
   - `your-super-secret-key-here`: chave secreta gerada
   - `re_4kbVkAVP_LCMAPcLwdm3kSJtya7zr6N9H`: chave da API do Resend (já configurada)
4. **Salve o arquivo**
5. **Nunca commite** o arquivo `.env` no git

## Verificar Configuração

Após criar o `.env`, execute:
```bash
npm run db:check
```

Se tudo estiver correto, execute:
```bash
npm run db:setup
```

## Testar Envio de Email

Para testar se o Resend está funcionando, você pode usar a rota de teste:

```bash
curl -X POST http://localhost:3000/api/communication/test
```

Ou acesse a página de comunicação no admin e use o botão de teste. 
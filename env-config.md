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
# CONFIGURAÇÃO DE EMAIL (SMTP)
# ===========================================

# Configurações SMTP para envio de emails
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"

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

## Configuração do Gmail para SMTP

Para usar o Gmail para envio de emails:

1. **Ative a verificação em duas etapas** na sua conta Google
2. **Gere uma senha de app**:
   - Vá para https://myaccount.google.com/apppasswords
   - Selecione "Email" e "Outro (nome personalizado)"
   - Digite um nome (ex: "Admin Jornada")
   - Copie a senha gerada (16 caracteres)
3. **Use essa senha** no campo `SMTP_PASS`

## Passos para Configurar

1. **Crie o arquivo `.env`** na raiz do projeto
2. **Copie o conteúdo** acima para o arquivo
3. **Substitua os valores** pelos seus dados reais:
   - `username`: seu usuário PostgreSQL
   - `password`: sua senha PostgreSQL
   - `project6_db`: nome da sua base de dados
   - `your-super-secret-key-here`: chave secreta gerada
   - `seu-email@gmail.com`: seu email Gmail
   - `sua-senha-de-app`: senha de app do Gmail
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
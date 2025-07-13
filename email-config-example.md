# Configuração de Email para o Sistema

## Configuração SMTP

Para que o sistema de comunicação funcione corretamente, você precisa configurar as variáveis de ambiente SMTP no arquivo `.env`.

### Exemplo de Configuração

```env
# ===========================================
# CONFIGURAÇÃO DE EMAIL (SMTP)
# ===========================================

# Configurações SMTP para envio de emails
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
```

## Configuração do Gmail

### 1. Ativar Verificação em Duas Etapas

1. Aceda à sua conta Google
2. Vá para "Segurança"
3. Ative "Verificação em duas etapas"

### 2. Gerar Senha de App

1. Vá para https://myaccount.google.com/apppasswords
2. Selecione "Email" e "Outro (nome personalizado)"
3. Digite um nome (ex: "Admin Jornada")
4. Clique em "Gerar"
5. Copie a senha gerada (16 caracteres)

### 3. Configurar no .env

Use a senha gerada no campo `SMTP_PASS`:

```env
SMTP_PASS="abcd efgh ijkl mnop"
```

## Outros Provedores SMTP

### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="seu-email@outlook.com"
SMTP_PASS="sua-senha"
```

### Yahoo
```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
SMTP_USER="seu-email@yahoo.com"
SMTP_PASS="sua-senha-de-app"
```

### Servidor SMTP Personalizado
```env
SMTP_HOST="seu-servidor-smtp.com"
SMTP_PORT="587"
SMTP_USER="seu-usuario"
SMTP_PASS="sua-senha"
```

## Testar Configuração

1. Configure as variáveis no arquivo `.env`
2. Reinicie o servidor de desenvolvimento
3. Vá para a página de Comunicação
4. Clique em "Testar Conexão"
5. Se aparecer "Conexão SMTP estabelecida com sucesso", está tudo configurado!

## Variáveis Disponíveis nos Templates

Ao criar templates de email, você pode usar as seguintes variáveis:

- `{nome}` - Nome do candidato
- `{email}` - Email do candidato
- `{curso}` - Nome do curso
- `{estado}` - Status do candidato
- `{pais}` - País do candidato
- `{telefone}` - Telefone do candidato

### Exemplo de Template

```
Olá {nome},

Obrigado por se candidatar ao curso {curso}.

O seu estado atual é: {estado}

Aguarde mais informações em breve.

Cumprimentos,
Equipa da Jornada
```

## Troubleshooting

### Erro: "Falha na conexão SMTP"

1. Verifique se as credenciais estão corretas
2. Certifique-se de que a verificação em duas etapas está ativada (Gmail)
3. Use uma senha de app em vez da senha normal
4. Verifique se o firewall não está a bloquear a porta 587

### Erro: "Authentication failed"

1. Verifique se o email e senha estão corretos
2. Para Gmail, use uma senha de app
3. Certifique-se de que a conta não está bloqueada

### Emails não chegam aos destinatários

1. Verifique se os emails não estão na pasta de spam
2. Teste com um email seu primeiro
3. Verifique se o domínio do remetente não está bloqueado 
# Configuração de Email para o Sistema

## Configuração Resend

O sistema agora usa o **Resend** para envio de emails, que é mais moderno, confiável e fácil de configurar que SMTP tradicional.

### Exemplo de Configuração

```env
# ===========================================
# CONFIGURAÇÃO DE EMAIL (RESEND)
# ===========================================

# Chave da API do Resend para envio de emails
RESEND_API_KEY="re_4kbVkAVP_LCMAPcLwdm3kSJtya7zr6N9H"
```

## Configuração do Resend

### 1. Criar Conta no Resend

1. Aceda a https://resend.com
2. Crie uma conta gratuita
3. Verifique o seu email

### 2. Configurar Domínio

1. No dashboard do Resend, vá para "Domains"
2. Clique em "Add Domain"
3. Adicione o domínio: `jornada-porto.pt`
4. Configure os registros DNS conforme instruções do Resend

### 3. Obter Chave da API

1. No dashboard, vá para "API Keys"
2. Clique em "Create API Key"
3. Dê um nome à chave (ex: "Admin Jornada")
4. Copie a chave gerada (começa com `re_`)

### 4. Configurar no .env

Use a chave da API no campo `RESEND_API_KEY`:

```env
RESEND_API_KEY="re_4kbVkAVP_LCMAPcLwdm3kSJtya7zr6N9H"
```

## Vantagens do Resend

- ✅ **Entrega confiável**: Taxa de entrega superior a 99%
- ✅ **Analytics**: Rastreamento de aberturas e cliques
- ✅ **Templates**: Suporte a templates HTML avançados
- ✅ **API moderna**: RESTful API com TypeScript
- ✅ **Webhooks**: Notificações em tempo real
- ✅ **Sem configuração SMTP**: Configuração simples
- ✅ **Domínio personalizado**: Use jornada-porto.pt
- ✅ **Suporte a múltiplos domínios**: Fácil gestão

## Configuração do Domínio

### Registros DNS Necessários

Após adicionar o domínio no Resend, configure estes registros DNS:

```
Tipo: TXT
Nome: @
Valor: v=spf1 include:_spf.resend.com ~all

Tipo: CNAME
Nome: _resend
Valor: resend.com

Tipo: TXT
Nome: _resend
Valor: resend-verification=seu-codigo-de-verificacao
```

### Verificação do Domínio

1. Configure os registros DNS no seu provedor de domínio
2. Aguarde a propagação (pode demorar até 24h)
3. No dashboard do Resend, clique em "Verify Domain"
4. Quando verificado, o domínio ficará verde

## Testar Configuração

1. Configure a chave da API no arquivo `.env`
2. Reinicie o servidor de desenvolvimento
3. Vá para a página de Comunicação
4. Clique em "Testar Conexão"
5. Se aparecer "Conexão com Resend estabelecida com sucesso", está tudo configurado!

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

## Templates HTML Avançados

O Resend suporta templates HTML completos. Exemplo:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Jornada Porto</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Jornada Porto</h1>
        
        <p>Olá <strong>{nome}</strong>,</p>
        
        <p>Obrigado por se candidatar ao curso <strong>{curso}</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Informações da Candidatura</h3>
            <p><strong>Estado:</strong> {estado}</p>
            <p><strong>País:</strong> {pais}</p>
            <p><strong>Telefone:</strong> {telefone}</p>
        </div>
        
        <p>Aguarde mais informações em breve.</p>
        
        <p>Cumprimentos,<br>
        <strong>Equipa da Jornada</strong></p>
    </div>
</body>
</html>
```

## Troubleshooting

### Erro: "Falha na conexão com Resend"

1. Verifique se a chave da API está correta
2. Certifique-se de que a chave não expirou
3. Verifique se o domínio está verificado no Resend
4. Teste a chave no dashboard do Resend

### Erro: "Authentication failed"

1. Verifique se a chave da API está correta
2. Certifique-se de que a chave tem permissões de envio
3. Verifique se a conta do Resend está ativa

### Emails não chegam aos destinatários

1. Verifique se os emails não estão na pasta de spam
2. Teste com um email seu primeiro
3. Verifique se o domínio está verificado no Resend
4. Consulte os logs no dashboard do Resend

### Erro de domínio não verificado

1. Configure os registros DNS corretamente
2. Aguarde a propagação dos registros DNS (até 24h)
3. Verifique se os registros estão corretos usando ferramentas online
4. Contacte o suporte do Resend se necessário

## Limites e Preços

### Plano Gratuito
- 3,000 emails/mês
- 1 domínio verificado
- Suporte por email

### Planos Pagos
- Emails ilimitados
- Múltiplos domínios
- Analytics avançados
- Suporte prioritário

Consulte https://resend.com/pricing para mais detalhes. 
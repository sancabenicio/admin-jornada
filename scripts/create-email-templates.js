const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const templates = [
  {
    name: 'Boas-vindas',
    subject: 'Bem-vindo ao curso {curso} - Coração da Jornada',
    content: `Olá {nome},

Bem-vindo ao curso "{curso}"!

Estamos muito felizes por ter escolhido a Coração da Jornada para a sua formação.

Informações importantes:
- Curso: {curso}
- Email de contacto: cfp@jornada-porto.pt
- Telefone: +351 123 456 789

Em breve receberá mais informações sobre o início das aulas e horários.

Se tiver alguma questão, não hesite em contactar-nos através do email: cfp@jornada-porto.pt

Atenciosamente,
Equipa Coração da Jornada`,
    type: 'WELCOME'
  },
  {
    name: 'Aceitação de Candidatura',
    subject: 'Candidatura Aceite - {curso}',
    content: `Olá {nome},

Temos o prazer de informar que a sua candidatura ao curso "{curso}" foi aceite!

Próximos passos:
1. Aguarde contacto da nossa equipa para confirmação de horários
2. Prepare os documentos necessários
3. Compareça no local indicado na data marcada

Informações importantes:
- Curso: {curso}
- Estado: {estado}
- Email de contacto: cfp@jornada-porto.pt

Se tiver alguma questão, não hesite em contactar-nos através do email: cfp@jornada-porto.pt

Atenciosamente,
Equipa Coração da Jornada`,
    type: 'ACCEPTANCE'
  },
  {
    name: 'Rejeição de Candidatura',
    subject: 'Resposta à Candidatura - {curso}',
    content: `Olá {nome},

Obrigado pelo seu interesse no curso "{curso}".

Após análise cuidadosa da sua candidatura, lamentamos informar que não foi possível aceitar a sua candidatura neste momento.

Informações importantes:
- Curso: {curso}
- Estado: {estado}

Para mais informações sobre outros cursos disponíveis, visite o nosso website ou contacte-nos através do email: cfp@jornada-porto.pt

Agradecemos o seu interesse e desejamos-lhe sucesso nos seus projetos futuros.

Atenciosamente,
Equipa Coração da Jornada`,
    type: 'REJECTION'
  },
  {
    name: 'Lembrete de Aula',
    subject: 'Lembrete - Aula de {curso}',
    content: `Olá {nome},

Este é um lembrete amigável sobre a próxima aula do curso "{curso}".

Informações da aula:
- Curso: {curso}
- Data: [Data da aula]
- Hora: [Hora da aula]
- Local: [Local da aula]

Por favor, confirme a sua presença respondendo a este email ou contactando-nos através de: cfp@jornada-porto.pt

Se não puder comparecer, informe-nos com antecedência.

Atenciosamente,
Equipa Coração da Jornada`,
    type: 'REMINDER'
  }
];

async function createTemplates() {
  try {
    console.log('Iniciando criação de templates de email...');

    for (const template of templates) {
      const existingTemplate = await prisma.emailTemplate.findFirst({
        where: { name: template.name }
      });

      if (existingTemplate) {
        console.log(`Template "${template.name}" já existe, atualizando...`);
        await prisma.emailTemplate.update({
          where: { id: existingTemplate.id },
          data: template
        });
      } else {
        console.log(`Criando template "${template.name}"...`);
        await prisma.emailTemplate.create({
          data: template
        });
      }
    }

    console.log('Templates de email criados/atualizados com sucesso!');
    
    const allTemplates = await prisma.emailTemplate.findMany();
    console.log('\nTemplates disponíveis:');
    allTemplates.forEach(template => {
      console.log(`- ${template.name} (${template.type})`);
    });

  } catch (error) {
    console.error('Erro ao criar templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTemplates(); 
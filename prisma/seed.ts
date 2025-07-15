import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@coracaodajornada.pt' },
    update: {},
    create: {
      email: 'admin@coracaodajornada.pt',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'Administração',
    },
  });

  console.log('Usuário administrador criado:', adminUser);

  await prisma.candidate.deleteMany({});
  await prisma.course.deleteMany({});

  const course1 = await prisma.course.create({
    data: {
      name: 'Técnico/a de Ação Educativa',
      description: 'Curso profissional focado na formação de técnicos especializados em ação educativa. O programa inclui componentes teóricas e práticas, culminando com estágio profissional. Durante o curso, os formandos desenvolverão competências essenciais para atuar em contextos educativos.\n\nCompetências Desenvolvidas:\n• Explicar o conceito de empreendedorismo\n• Identificar as vantagens e os riscos de ser empreendedor\n• Aplicar instrumentos de diagnóstico e de autodiagnóstico\n• Analisar o perfil pessoal e o potencial como empreendedor\n• Identificar necessidades de desenvolvimento técnico e comportamental',
      duration: '18 meses (incluindo estágio)',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-09-30'),
      maxStudents: 25,
      applicationLimit: 30,
      price: 0,
      location: 'Lisboa',
      image: '/courses/tecnica-educao.png',
      status: 'OPEN'
    },
  });

  const course2 = await prisma.course.create({
    data: {
      name: 'Técnico/a de Relações Laborais',
      description: 'Formação especializada em relações laborais, preparando profissionais para atuar na gestão de recursos humanos e relações de trabalho. O curso combina teoria e prática, incluindo estágio profissional.\n\nCompetências Desenvolvidas:\n• Explicar o conceito de empreendedorismo\n• Identificar as vantagens e os riscos de ser empreendedor\n• Aplicar instrumentos de diagnóstico e de autodiagnóstico\n• Analisar o perfil pessoal e o potencial como empreendedor\n• Identificar necessidades de desenvolvimento técnico e comportamental',
      duration: '18 meses (incluindo estágio)',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-09-30'),
      maxStudents: 25,
      applicationLimit: 30,
      price: 0,
      location: 'Porto',
      image: '/courses/laborais.png',
      status: 'OPEN'
    },
  });

  const course3 = await prisma.course.create({
    data: {
      name: 'Técnico/a Especialista de Gestão de Turismo',
      description: 'Curso avançado em gestão de turismo, formando especialistas para o setor turístico. Inclui componente prática com estágio profissional.\n\nCompetências Desenvolvidas:\n• Interpretar e produzir textos em inglês para situações profissionais\n• Interagir e comunicar fluentemente em inglês\n• Identificar a cultura, hábitos e valores do povo inglês\n• Demonstrar atitudes de cooperação e tolerância\n• Trabalhar em equipa e negociar\n• Relacionar informação de várias fontes',
      duration: '18 meses (incluindo estágio)',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-09-30'),
      maxStudents: 25,
      applicationLimit: 30,
      price: 0,
      location: 'Faro',
      image: '/courses/turismo.png',
      status: 'OPEN'
    },
  });

  console.log('Cursos criados:', [course1.name, course2.name, course3.name]);

  const candidates1 = await Promise.all([
    prisma.candidate.create({
      data: {
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        phone: '+351 912 345 678',
        country: 'Portugal',
        age: 25,
        education: 'Ensino Superior Completo',
        experience: '2 anos em educação infantil',
        notes: 'Interessada em trabalhar com crianças e desenvolver competências educativas.',
        courseId: course1.id,
        status: 'REGISTERED'
      },
    }),
    prisma.candidate.create({
      data: {
        name: 'João Santos',
        email: 'joao.santos@email.com',
        phone: '+351 923 456 789',
        country: 'Portugal',
        age: 28,
        education: 'Ensino Superior Incompleto',
        experience: 'Voluntário em projetos educativos',
        notes: 'Quero mudar de carreira e trabalhar na área da educação.',
        courseId: course1.id,
        status: 'ACCEPTED'
      },
    }),
    prisma.candidate.create({
      data: {
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        phone: '+351 934 567 890',
        country: 'Portugal',
        age: 22,
        education: 'Ensino Médio',
        experience: 'Estagiária em jardim de infância',
        notes: 'Apaixonada por educação e desenvolvimento infantil.',
        courseId: course1.id,
        status: 'REGISTERED'
      },
    }),
  ]);

  // Criar candidatos para o segundo curso
  const candidates2 = await Promise.all([
    prisma.candidate.create({
      data: {
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        phone: '+351 945 678 901',
        country: 'Portugal',
        age: 30,
        education: 'Ensino Superior Completo',
        experience: '5 anos em recursos humanos',
        notes: 'Quero especializar-me em relações laborais e legislação.',
        courseId: course2.id,
        status: 'ACCEPTED'
      },
    }),
    prisma.candidate.create({
      data: {
        name: 'Sofia Martins',
        email: 'sofia.martins@email.com',
        phone: '+351 956 789 012',
        country: 'Portugal',
        age: 26,
        education: 'Ensino Superior Completo',
        experience: 'Assistente administrativa',
        notes: 'Interessada em transição para área de RH.',
        courseId: course2.id,
        status: 'REGISTERED'
      },
    }),
  ]);

  const candidates3 = await Promise.all([
    prisma.candidate.create({
      data: {
        name: 'Carlos Ferreira',
        email: 'carlos.ferreira@email.com',
        phone: '+351 967 890 123',
        country: 'Portugal',
        age: 24,
        education: 'Ensino Superior Completo',
        experience: 'Guia turístico freelance',
        notes: 'Quero especializar-me em gestão hoteleira e turística.',
        courseId: course3.id,
        status: 'REGISTERED'
      },
    }),
    prisma.candidate.create({
      data: {
        name: 'Inês Rodrigues',
        email: 'ines.rodrigues@email.com',
        phone: '+351 978 901 234',
        country: 'Portugal',
        age: 29,
        education: 'Ensino Superior Completo',
        experience: 'Rececionista de hotel',
        notes: 'Apaixonada por turismo e atendimento ao cliente.',
        courseId: course3.id,
        status: 'ACCEPTED'
      },
    }),
    prisma.candidate.create({
      data: {
        name: 'Miguel Alves',
        email: 'miguel.alves@email.com',
        phone: '+351 989 012 345',
        country: 'Portugal',
        age: 27,
        education: 'Ensino Superior Incompleto',
        experience: 'Vendedor em loja de souvenirs',
        notes: 'Quero desenvolver competências em gestão turística.',
        courseId: course3.id,
        status: 'REGISTERED'
      },
    }),
  ]);

  console.log('Candidatos criados:');
  console.log(`- Curso 1 (${course1.name}): ${candidates1.length} candidatos`);
  console.log(`- Curso 2 (${course2.name}): ${candidates2.length} candidatos`);
  console.log(`- Curso 3 (${course3.name}): ${candidates3.length} candidatos`);

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
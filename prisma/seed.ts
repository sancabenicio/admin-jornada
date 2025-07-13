import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash da senha 'admin123'
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Criar usuário administrador
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Configurando base de dados...');

try {
  // 1. Gerar cliente Prisma
  console.log('📦 Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 2. Executar migrações
  console.log('🔄 Executando migrações...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  
  // 3. Executar seed
  console.log('🌱 Executando seed...');
  execSync('npm run db:seed', { stdio: 'inherit' });
  
  // 4. Verificar se tudo está funcionando
  console.log('🔍 Verificando configuração...');
  execSync('npm run db:check', { stdio: 'inherit' });
  
  console.log('✅ Base de dados configurada com sucesso!');
  console.log('🎉 Pode agora iniciar o servidor com: npm run dev');
  
} catch (error) {
  console.error('❌ Erro durante a configuração:', error.message);
  process.exit(1);
} 
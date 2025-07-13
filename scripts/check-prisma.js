const { PrismaClient } = require('@prisma/client');

async function checkPrisma() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando conexão com a base de dados...');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão com a base de dados estabelecida');
    
    // Verificar se as tabelas existem
    console.log('🔍 Verificando tabelas...');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('candidates', 'courses', 'users', 'blog_posts', 'email_templates', 'notifications')
    `;
    
    console.log('📋 Tabelas encontradas:', tables.map(t => t.table_name));
    
    // Verificar estrutura da tabela candidates
    console.log('🔍 Verificando estrutura da tabela candidates...');
    const candidateColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'candidates' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Colunas da tabela candidates:');
    candidateColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Contar registos
    const candidateCount = await prisma.candidate.count();
    const courseCount = await prisma.course.count();
    
    console.log(`📊 Estatísticas:`);
    console.log(`  - Candidatos: ${candidateCount}`);
    console.log(`  - Cursos: ${courseCount}`);
    
    console.log('✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrisma(); 
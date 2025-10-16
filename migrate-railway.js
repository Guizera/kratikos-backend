const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Usar a DATABASE_URL do Railway
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'migrate-complete.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📦 Executando migração...');
    await client.query(sql);
    console.log('🎉 Migração executada com sucesso!');

    // Verificar se as tabelas foram criadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📋 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada');
  }
}

runMigration();



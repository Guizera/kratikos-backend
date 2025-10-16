const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrateMissing() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado!');

    const sqlPath = path.join(__dirname, 'migrate-missing.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📦 Adicionando tabelas faltantes...');
    await client.query(sql);
    console.log('✅ Tabelas adicionadas!');

    // Verificar
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`\n📋 Total de tabelas: ${result.rows.length}`);
    result.rows.forEach(row => console.log(`  ✅ ${row.table_name}`));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrateMissing();

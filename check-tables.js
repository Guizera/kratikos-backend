const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🔌 Conectado ao PostgreSQL');

    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    if (result.rows.length === 0) {
      console.log('❌ Nenhuma tabela encontrada');
    } else {
      console.log(`\n📋 Tabelas existentes (${result.rows.length}):`);
      result.rows.forEach(row => {
        console.log(`  ✅ ${row.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();

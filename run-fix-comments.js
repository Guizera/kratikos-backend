const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔧 Conectando ao banco de dados...');
    const client = await pool.connect();
    
    console.log('📝 Lendo migration...');
    const migrationPath = path.join(__dirname, 'migrations', '2025-12-06-fix-comments-user-id.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Executando migration...');
    await client.query(sql);
    
    console.log('✅ Migration executada com sucesso!');
    
    // Verificar quantos comentários restaram
    const result = await client.query('SELECT COUNT(*) as total FROM comments');
    console.log(`📊 Total de comentários após migration: ${result.rows[0].total}`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    process.exit(1);
  }
}

runMigration();


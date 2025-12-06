const { Pool } = require('pg');

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔍 Verificando schema da tabela comments...\n');
    const client = await pool.connect();
    
    // Verificar colunas da tabela comments
    const columnsResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'comments'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Colunas da tabela comments:');
    console.table(columnsResult.rows);
    
    // Verificar se user_id tem foreign key
    const fkResult = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'comments'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id';
    `);
    
    console.log('\n🔗 Foreign Keys relacionadas a user_id:');
    if (fkResult.rows.length > 0) {
      console.table(fkResult.rows);
    } else {
      console.log('⚠️  Nenhuma foreign key encontrada para user_id');
    }
    
    // Contar comentários
    const countResult = await client.query('SELECT COUNT(*) as total FROM comments');
    console.log(`\n📊 Total de comentários: ${countResult.rows[0].total}`);
    
    // Contar comentários com user_id NULL
    const nullResult = await client.query('SELECT COUNT(*) as total FROM comments WHERE user_id IS NULL');
    console.log(`⚠️  Comentários com user_id NULL: ${nullResult.rows[0].total}`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkSchema();


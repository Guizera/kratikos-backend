const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrateDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🔌 Conectado ao banco de dados');

    // Ler o arquivo SQL de migração
    const sqlPath = path.join(__dirname, '../../../init_kratikos.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Executar a migração
    console.log('📦 Executando migração...');
    await client.query(sql);
    console.log('✅ Migração executada com sucesso!');

    // Inserir dados iniciais se necessário
    await insertInitialData(client);

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function insertInitialData(client) {
  try {
    // Verificar se já existem dados
    const { rows } = await client.query('SELECT COUNT(*) FROM categories');
    
    if (parseInt(rows[0].count) === 0) {
      console.log('📝 Inserindo dados iniciais...');
      
      // Inserir categorias padrão
      await client.query(`
        INSERT INTO categories (name, description, icon_url) VALUES
        ('Política', 'Discussões sobre políticas públicas e governança', '🏛️'),
        ('Meio Ambiente', 'Questões ambientais e sustentabilidade', '🌱'),
        ('Educação', 'Temas relacionados à educação e ensino', '📚'),
        ('Saúde', 'Discussões sobre saúde pública e bem-estar', '🏥'),
        ('Transporte', 'Mobilidade urbana e transporte público', '🚌'),
        ('Segurança', 'Segurança pública e cidadã', '🛡️'),
        ('Economia', 'Questões econômicas e desenvolvimento', '💰'),
        ('Cultura', 'Arte, cultura e patrimônio histórico', '🎭')
      `);

      // Inserir tags padrão
      await client.query(`
        INSERT INTO tags (name) VALUES
        ('urgente'), ('proposta'), ('discussao'), ('votacao'),
        ('municipal'), ('estadual'), ('federal'), ('local'),
        ('transparencia'), ('participacao'), ('cidadania')
      `);

      console.log('✅ Dados iniciais inseridos com sucesso!');
    } else {
      console.log('ℹ️ Dados já existem, pulando inserção inicial');
    }
  } catch (error) {
    console.error('⚠️ Erro ao inserir dados iniciais:', error);
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };

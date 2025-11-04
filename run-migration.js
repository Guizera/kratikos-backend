#!/usr/bin/env node

/**
 * Script para executar migrações SQL no banco de dados
 * 
 * Uso:
 *   node run-migration.js <arquivo-migration.sql>
 *   
 * Exemplo:
 *   node run-migration.js migrations/2025-10-16-add-social-auth.sql
 *   
 * Com DATABASE_URL customizada:
 *   DATABASE_URL="postgresql://..." node run-migration.js migrations/xxx.sql
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Validar argumentos
const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('❌ Erro: Nenhum arquivo de migração especificado\n');
  console.log('Uso: node run-migration.js <arquivo-migration.sql>\n');
  console.log('Exemplo:');
  console.log('  node run-migration.js migrations/2025-10-16-add-social-auth.sql\n');
  process.exit(1);
}

// Verificar se arquivo existe
const filePath = path.isAbsolute(migrationFile) 
  ? migrationFile 
  : path.join(__dirname, migrationFile);

if (!fs.existsSync(filePath)) {
  console.error(`❌ Erro: Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

// Obter DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Erro: DATABASE_URL não definida\n');
  console.log('Execute com Railway CLI:');
  console.log('  railway run node run-migration.js migrations/xxx.sql\n');
  console.log('Ou defina DATABASE_URL:');
  console.log('  DATABASE_URL="postgresql://..." node run-migration.js migrations/xxx.sql\n');
  process.exit(1);
}

// Ler SQL
const sql = fs.readFileSync(filePath, 'utf8');
const fileName = path.basename(filePath);

console.log('🔄 Executando Migração\n');
console.log(`📄 Arquivo: ${fileName}`);
console.log(`🗄️  Banco: ${DATABASE_URL.split('@')[1]}\n`);

// Conectar e executar
const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('✅ Conectado ao banco de dados');
    console.log('📝 Executando SQL...\n');
    return client.query(sql);
  })
  .then((result) => {
    console.log('✅ Migração aplicada com sucesso!\n');
    
    if (result.rowCount !== undefined && result.rowCount > 0) {
      console.log(`📊 Linhas afetadas: ${result.rowCount}`);
    }
    
    console.log('\n✨ Concluído!');
    return client.end();
  })
  .catch(err => {
    console.error('\n❌ Erro ao executar migração:');
    console.error(`   ${err.message}\n`);
    
    if (err.detail) {
      console.error('Detalhes:', err.detail);
    }
    
    if (err.hint) {
      console.error('Dica:', err.hint);
    }
    
    client.end();
    process.exit(1);
  });


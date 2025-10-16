const { Client } = require('pg');
const fs = require('fs');

const sql = fs.readFileSync('migrate-social-auth.sql', 'utf8');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => client.query(sql))
  .then(() => {
    console.log('✅ Migração aplicada com sucesso!');
    return client.end();
  })
  .catch(err => {
    console.error('❌ Erro:', err.message);
    client.end();
    process.exit(1);
  });


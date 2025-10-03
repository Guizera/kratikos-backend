import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // Suporte para DATABASE_URL (Railway, Heroku, etc.) ou configurações individuais
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'kratikos_user',
  password: process.env.DATABASE_PASSWORD || 'kratikos_password',
  database: process.env.DATABASE_NAME || 'kratikos_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}));

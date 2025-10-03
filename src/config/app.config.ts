import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  },
  swagger: {
    enabled: process.env.NODE_ENV !== 'production',
    title: 'Kratikos API',
    description: 'API do sistema de participação cidadã Kratikos',
    version: '1.0',
  },
}));

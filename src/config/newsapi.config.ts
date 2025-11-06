import { registerAs } from '@nestjs/config';

export default registerAs('newsapi', () => ({
  apiKey: process.env.NEWSAPI_API_KEY || '',
}));


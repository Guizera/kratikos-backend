import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Configurar arquivos estáticos (uploads)
  // Em produção (Railway), usar /tmp/uploads (não persistente!)
  const defaultPath = process.env.NODE_ENV === 'production' ? '/tmp/uploads/' : 'uploads/';
  const uploadPath = configService.get<string>('app.upload.uploadPath') || defaultPath;
  
  // Se começar com /, usar caminho absoluto (produção)
  const fullPath = uploadPath.startsWith('/') 
    ? uploadPath 
    : join(process.cwd(), uploadPath);
  
  app.useStaticAssets(fullPath, {
    prefix: '/uploads/',
  });
  
  console.log(`📁 Servindo uploads de: ${fullPath}`);

  // Configuração do CORS
  const corsOptions = configService.get('app.cors');
  app.enableCors(corsOptions);

  // Configuração do Pipes globais
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuração do Swagger (apenas em desenvolvimento)
  const swaggerConfig = configService.get('app.swagger');
  if (swaggerConfig.enabled) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    console.log('📚 Swagger disponível em /api');
  }

  // Healthcheck endpoint
  app.getHttpAdapter().get('/', (req: any, res: any) => {
    res.json({
      status: 'ok',
      message: 'Kratikos API está funcionando!',
      timestamp: new Date().toISOString(),
      environment: configService.get('app.environment'),
    });
  });

  // Iniciar servidor
  const port = configService.get('app.port') || process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Kratikos API rodando na porta ${port}`);
  console.log(`🌍 Ambiente: ${configService.get('app.environment')}`);
  
  if (swaggerConfig.enabled) {
    console.log(`📖 Documentação: http://localhost:${port}/api`);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Erro ao inicializar aplicação:', error);
  process.exit(1);
});
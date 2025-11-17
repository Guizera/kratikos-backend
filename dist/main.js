"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const defaultPath = process.env.NODE_ENV === 'production' ? '/tmp/uploads/' : 'uploads/';
    const uploadPath = configService.get('app.upload.uploadPath') || defaultPath;
    const fullPath = uploadPath.startsWith('/')
        ? uploadPath
        : (0, path_1.join)(process.cwd(), uploadPath);
    app.useStaticAssets(fullPath, {
        prefix: '/uploads/',
    });
    console.log(`📁 Servindo uploads de: ${fullPath}`);
    const corsOptions = configService.get('app.cors');
    app.enableCors(corsOptions);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const swaggerConfig = configService.get('app.swagger');
    if (swaggerConfig.enabled) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle(swaggerConfig.title)
            .setDescription(swaggerConfig.description)
            .setVersion(swaggerConfig.version)
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api', app, document);
        console.log('📚 Swagger disponível em /api');
    }
    app.getHttpAdapter().get('/', (req, res) => {
        res.json({
            status: 'ok',
            message: 'Kratikos API está funcionando!',
            timestamp: new Date().toISOString(),
            environment: configService.get('app.environment'),
        });
    });
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
//# sourceMappingURL=main.js.map
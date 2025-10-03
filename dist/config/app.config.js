"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    environment: process.env.NODE_ENV || 'development',
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: true,
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
        uploadPath: process.env.UPLOAD_PATH || 'uploads/',
    },
    swagger: {
        enabled: process.env.NODE_ENV !== 'production',
        title: 'Kratikos API',
        description: 'API do sistema de participação cidadã Kratikos',
        version: '1.0',
    },
}));
//# sourceMappingURL=app.config.js.map
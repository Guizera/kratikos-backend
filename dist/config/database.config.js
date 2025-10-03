"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'kratikos_user',
    password: process.env.DATABASE_PASSWORD || 'kratikos_password',
    database: process.env.DATABASE_NAME || 'kratikos_db',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}));
//# sourceMappingURL=database.config.js.map
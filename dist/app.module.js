"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const posts_module_1 = require("./modules/posts/posts.module");
const comments_module_1 = require("./modules/comments/comments.module");
const polls_module_1 = require("./modules/polls/polls.module");
const news_module_1 = require("./modules/news/news.module");
const upload_module_1 = require("./modules/upload/upload.module");
const search_module_1 = require("./modules/search/search.module");
const database_config_1 = __importDefault(require("./config/database.config"));
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
const app_config_1 = __importDefault(require("./config/app.config"));
const openai_config_1 = __importDefault(require("./config/openai.config"));
const newsapi_config_1 = __importDefault(require("./config/newsapi.config"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default, jwt_config_1.default, app_config_1.default, openai_config_1.default, newsapi_config_1.default],
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const config = {
                        type: 'postgres',
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        synchronize: process.env.NODE_ENV === 'development',
                        logging: process.env.NODE_ENV === 'development',
                    };
                    if (configService.get('database.url')) {
                        config.url = configService.get('database.url');
                        config.ssl = configService.get('database.ssl');
                    }
                    else {
                        config.host = configService.get('database.host');
                        config.port = configService.get('database.port');
                        config.username = configService.get('database.username');
                        config.password = configService.get('database.password');
                        config.database = configService.get('database.database');
                        config.ssl = configService.get('database.ssl');
                    }
                    return config;
                },
                inject: [config_1.ConfigService],
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            posts_module_1.PostsModule,
            comments_module_1.CommentsModule,
            polls_module_1.PollsModule,
            news_module_1.NewsModule,
            upload_module_1.UploadModule,
            search_module_1.SearchModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { PollsModule } from './modules/polls/polls.module';
import { NewsModule } from './modules/news/news.module';
import { UploadModule } from './modules/upload/upload.module';
import { SearchModule } from './modules/search/search.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import openaiConfig from './config/openai.config';
import newsapiConfig from './config/newsapi.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig, openaiConfig, newsapiConfig],
    }),
    ScheduleModule.forRoot(), // Habilita cron jobs
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config: any = {
          type: 'postgres',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: process.env.NODE_ENV === 'development',
          logging: process.env.NODE_ENV === 'development',
        };

        // Usar DATABASE_URL se disponível (Railway, Heroku, etc.)
        if (configService.get('database.url')) {
          config.url = configService.get('database.url');
          config.ssl = configService.get('database.ssl');
        } else {
          // Usar configurações individuais
          config.host = configService.get('database.host');
          config.port = configService.get('database.port');
          config.username = configService.get('database.username');
          config.password = configService.get('database.password');
          config.database = configService.get('database.database');
          config.ssl = configService.get('database.ssl');
        }

        return config;
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    PollsModule,
    NewsModule,
    UploadModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
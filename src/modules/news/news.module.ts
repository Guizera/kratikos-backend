import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsSyncService } from './services/news-sync.service';
import { NewsArticle } from './entities/news-article.entity';
import { NewsLike } from './entities/news-like.entity';
import { NewsShare } from './entities/news-share.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([NewsArticle, NewsLike, NewsShare]),
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsSyncService],
  exports: [NewsService],
})
export class NewsModule {}


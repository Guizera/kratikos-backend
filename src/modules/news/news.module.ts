import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsSyncService } from './services/news-sync.service';
import { NewsCommentsService } from './services/news-comments.service';
import { NewsCommentsController } from './controllers/news-comments.controller';
import { NewsArticle } from './entities/news-article.entity';
import { NewsLike } from './entities/news-like.entity';
import { NewsShare } from './entities/news-share.entity';
import { NewsComment } from './entities/news-comment.entity';
import { NewsCommentPollOption } from './entities/news-comment-poll-option.entity';
import { NewsCommentPollVote } from './entities/news-comment-poll-vote.entity';
import { NewsCommentLike } from './entities/news-comment-like.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      NewsArticle,
      NewsLike,
      NewsShare,
      NewsComment,
      NewsCommentPollOption,
      NewsCommentPollVote,
      NewsCommentLike,
    ]),
  ],
  controllers: [NewsController, NewsCommentsController],
  providers: [NewsService, NewsSyncService, NewsCommentsService],
  exports: [NewsService, NewsCommentsService],
})
export class NewsModule {}


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Poll } from '../polls/entities/poll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Poll])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}


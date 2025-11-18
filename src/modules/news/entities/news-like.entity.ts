import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Unique, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NewsArticle } from './news-article.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('news_likes')
@Unique(['userId', 'newsId']) // Garante que um usuário só pode curtir uma notícia uma vez
export class NewsLike {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único da curtida' })
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Usuário que curtiu' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => NewsArticle, news => news.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'news_id' })
  @ApiProperty({ description: 'Notícia curtida' })
  news: NewsArticle;

  @Column({ name: 'news_id' })
  newsId: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data da curtida' })
  createdAt: Date;
}


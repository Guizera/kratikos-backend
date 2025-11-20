import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { NewsArticle } from './news-article.entity';
import { User } from '../../users/entities/user.entity';
import { NewsCommentPollOption } from './news-comment-poll-option.entity';
import { NewsCommentLike } from './news-comment-like.entity';

export enum NewsCommentType {
  TEXT = 'text',
  POLL = 'poll',
}

@Entity('news_comments')
export class NewsComment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do comentário' })
  id: string;

  @Column({ name: 'news_id' })
  @ApiProperty({ description: 'ID da notícia' })
  newsId: string;

  @ManyToOne(() => NewsArticle)
  @JoinColumn({ name: 'news_id' })
  @ApiProperty({ description: 'Notícia comentada' })
  news: NewsArticle;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'ID do usuário' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Autor do comentário' })
  user: User;

  @Column({ name: 'parent_comment_id', nullable: true })
  @ApiProperty({ description: 'ID do comentário pai (para respostas)' })
  parentCommentId: string | null;

  @ManyToOne(() => NewsComment, { nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  @ApiProperty({ description: 'Comentário pai' })
  parentComment: NewsComment | null;

  @OneToMany(() => NewsComment, comment => comment.parentComment)
  @ApiProperty({ description: 'Respostas ao comentário' })
  replies: NewsComment[];

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Conteúdo do comentário' })
  content: string;

  @Column({
    name: 'comment_type',
    type: 'enum',
    enum: NewsCommentType,
    default: NewsCommentType.TEXT,
  })
  @ApiProperty({ description: 'Tipo do comentário', enum: NewsCommentType })
  commentType: NewsCommentType;

  @OneToMany(() => NewsCommentPollOption, option => option.comment)
  @ApiProperty({ description: 'Opções da sub-enquete (se commentType = poll)' })
  pollOptions: NewsCommentPollOption[];

  @OneToMany(() => NewsCommentLike, like => like.comment)
  @ApiProperty({ description: 'Curtidas no comentário' })
  likes: NewsCommentLike[];

  @Column({ name: 'likes_count', default: 0 })
  @ApiProperty({ description: 'Número de curtidas' })
  likesCount: number;

  @Column({ name: 'replies_count', default: 0 })
  @ApiProperty({ description: 'Número de respostas' })
  repliesCount: number;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}


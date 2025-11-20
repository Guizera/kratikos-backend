import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { NewsComment } from './news-comment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('news_comment_likes')
export class NewsCommentLike {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único da curtida' })
  id: string;

  @Column({ name: 'comment_id' })
  @ApiProperty({ description: 'ID do comentário curtido' })
  commentId: string;

  @ManyToOne(() => NewsComment, comment => comment.likes)
  @JoinColumn({ name: 'comment_id' })
  @ApiProperty({ description: 'Comentário curtido' })
  comment: NewsComment;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'ID do usuário' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Usuário que curtiu' })
  user: User;

  @CreateDateColumn({ name: 'liked_at' })
  @ApiProperty({ description: 'Data da curtida' })
  likedAt: Date;
}


import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { NewsCommentPollOption } from './news-comment-poll-option.entity';
import { User } from '../../users/entities/user.entity';

@Entity('news_comment_poll_votes')
export class NewsCommentPollVote {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do voto' })
  id: string;

  @Column({ name: 'option_id' })
  @ApiProperty({ description: 'ID da opção votada' })
  optionId: string;

  @ManyToOne(() => NewsCommentPollOption, option => option.votes)
  @JoinColumn({ name: 'option_id' })
  @ApiProperty({ description: 'Opção votada' })
  option: NewsCommentPollOption;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'ID do usuário que votou' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Usuário que votou' })
  user: User;

  @CreateDateColumn({ name: 'voted_at' })
  @ApiProperty({ description: 'Data do voto' })
  votedAt: Date;
}


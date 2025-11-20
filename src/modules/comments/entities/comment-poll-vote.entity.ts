import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CommentPollOption } from './comment-poll-option.entity';
import { User } from '../../users/entities/user.entity';

@Entity('comment_poll_votes')
export class CommentPollVote {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do voto' })
  id: string;

  @Column({ name: 'option_id' })
  @ApiProperty({ description: 'ID da opção votada' })
  optionId: string;

  @ManyToOne(() => CommentPollOption, option => option.votes)
  @JoinColumn({ name: 'option_id' })
  @ApiProperty({ description: 'Opção votada' })
  option: CommentPollOption;

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


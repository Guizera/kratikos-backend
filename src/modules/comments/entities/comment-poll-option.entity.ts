import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Comment } from './comment.entity';
import { CommentPollVote } from './comment-poll-vote.entity';

@Entity('comment_poll_options')
export class CommentPollOption {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único da opção' })
  id: string;

  @Column({ name: 'comment_id' })
  @ApiProperty({ description: 'ID do comentário (sub-enquete)' })
  commentId: string;

  @ManyToOne(() => Comment, comment => comment.pollOptions)
  @JoinColumn({ name: 'comment_id' })
  @ApiProperty({ description: 'Comentário da sub-enquete' })
  comment: Comment;

  @Column({ name: 'option_text', length: 200 })
  @ApiProperty({ description: 'Texto da opção' })
  optionText: string;

  @Column({ name: 'votes_count', default: 0 })
  @ApiProperty({ description: 'Número de votos' })
  votesCount: number;

  @Column({ name: 'display_order', default: 0 })
  @ApiProperty({ description: 'Ordem de exibição' })
  displayOrder: number;

  @OneToMany(() => CommentPollVote, vote => vote.option)
  @ApiProperty({ description: 'Votos nesta opção' })
  votes: CommentPollVote[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;
}


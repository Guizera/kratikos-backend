import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Poll } from './poll.entity';
import { PollOption } from './poll-option.entity';

@Entity('poll_votes')
export class PollVote {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID do voto' })
  id: string;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'ID do usuário que votou' })
  userId: string;

  @Column({ name: 'poll_id' })
  @ApiProperty({ description: 'ID da enquete' })
  pollId: string;

  @Column({ name: 'option_id' })
  @ApiProperty({ description: 'ID da opção escolhida' })
  optionId: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data do voto' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Poll)
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @ManyToOne(() => PollOption)
  @JoinColumn({ name: 'option_id' })
  option: PollOption;
}


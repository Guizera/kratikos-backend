import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Poll } from './poll.entity';

@Entity('poll_options')
export class PollOption {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único da opção' })
  id: string;

  @ManyToOne(() => Poll, poll => poll.options)
  @JoinColumn({ name: 'poll_id' })
  @ApiProperty({ description: 'Enquete relacionada' })
  poll: Poll;

  @Column({ name: 'poll_id' })
  pollId: string;

  @Column('text')
  @ApiProperty({ description: 'Conteúdo da opção' })
  content: string;

  @Column({ name: 'votes_count', default: 0 })
  @ApiProperty({ description: 'Número de votos' })
  votesCount: number;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

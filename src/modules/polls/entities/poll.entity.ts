import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../../posts/entities/post.entity';
import { PollOption } from './poll-option.entity';

export enum PollStatus {
  ABERTA = 'aberta',
  FECHADA = 'fechada',
  CANCELADA = 'cancelada',
}

@Entity('polls')
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único da enquete' })
  id: string;

  @OneToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  @ApiProperty({ description: 'Post relacionado' })
  post: Post;

  @Column({ name: 'post_id' })
  postId: string;

  @Column('text')
  @ApiProperty({ description: 'Pergunta da enquete' })
  question: string;

  @Column('text', { nullable: true })
  @ApiProperty({ description: 'Descrição da enquete' })
  description: string;

  @Column({
    type: 'enum',
    enum: PollStatus,
    default: PollStatus.ABERTA
  })
  @ApiProperty({ description: 'Status da enquete', enum: PollStatus })
  status: PollStatus;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  @ApiProperty({ description: 'Data de início' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone', nullable: true })
  @ApiProperty({ description: 'Data de término' })
  endDate: Date;

  @Column({ name: 'min_options', default: 1 })
  @ApiProperty({ description: 'Mínimo de opções que podem ser selecionadas' })
  minOptions: number;

  @Column({ name: 'max_options', default: 1 })
  @ApiProperty({ description: 'Máximo de opções que podem ser selecionadas' })
  maxOptions: number;

  @OneToMany(() => PollOption, option => option.poll, { eager: true })
  @ApiProperty({ description: 'Opções da enquete' })
  options: PollOption[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;

  // Método auxiliar para verificar se a enquete está ativa
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === PollStatus.ABERTA &&
      (!this.endDate || this.endDate > now)
    );
  }
}

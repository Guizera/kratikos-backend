import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

export enum VoteType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  SKIP = 'skip',
}

@Entity('post_votes')
@Unique(['userId', 'postId'])
export class PostVote {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do voto' })
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Usuário que votou' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  @ApiProperty({ description: 'Post votado' })
  post: Post;

  @Column({ name: 'post_id' })
  postId: string;

  @Column({
    type: 'enum',
    enum: VoteType,
  })
  @ApiProperty({ description: 'Tipo do voto', enum: VoteType })
  voteType: VoteType;

  @Column({ name: 'device_fingerprint', nullable: true })
  @ApiProperty({ description: 'Fingerprint do dispositivo' })
  deviceFingerprint: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data do voto' })
  createdAt: Date;
}


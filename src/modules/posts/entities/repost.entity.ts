import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';

@Entity('reposts')
@Unique(['userId', 'originalPostId'])
export class Repost {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do repost' })
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Usuário que fez o repost' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Post, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'original_post_id' })
  @ApiProperty({ description: 'Post original que foi repostado' })
  originalPost: Post;

  @Column({ name: 'original_post_id' })
  originalPostId: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data do repost' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

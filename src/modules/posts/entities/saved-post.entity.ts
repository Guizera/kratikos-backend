import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from './post.entity';
import { User } from '../../users/entities/user.entity';

@Entity('saved_posts')
export class SavedPost {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do post salvo' })
  id: string;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'ID do usuário que salvou' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Usuário que salvou o post' })
  user: User;

  @Column({ name: 'post_id' })
  @ApiProperty({ description: 'ID do post salvo' })
  postId: string;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  @ApiProperty({ description: 'Post salvo' })
  post: Post;

  @CreateDateColumn({ name: 'saved_at' })
  @ApiProperty({ description: 'Data em que o post foi salvo' })
  savedAt: Date;
}


import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';

@Entity('post_likes')
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID do like' })
  id: string;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'ID do usuário que curtiu' })
  userId: string;

  @Column({ name: 'post_id' })
  @ApiProperty({ description: 'ID do post curtido' })
  postId: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data da curtida' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}


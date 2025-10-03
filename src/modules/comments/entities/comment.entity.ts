import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do comentário' })
  id: string;

  @ManyToOne(() => Post, post => post.comments)
  @ApiProperty({ description: 'Post relacionado' })
  post: Post;

  @Column({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty({ description: 'Autor do comentário' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Comment, { nullable: true })
  @ApiProperty({ description: 'Comentário pai (em caso de resposta)' })
  parent: Comment;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Column('text')
  @ApiProperty({ description: 'Conteúdo do comentário' })
  content: string;

  @Column({ name: 'likes_count', default: 0 })
  @ApiProperty({ description: 'Número de likes' })
  likesCount: number;

  @Column({ name: 'is_edited', default: false })
  @ApiProperty({ description: 'Indica se o comentário foi editado' })
  isEdited: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;

  @OneToMany(() => Comment, comment => comment.parent)
  replies: Comment[];
}

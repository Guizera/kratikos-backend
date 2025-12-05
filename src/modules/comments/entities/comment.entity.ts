import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { CommentPollOption } from './comment-poll-option.entity';
import { CommentLike } from './comment-like.entity';

export enum CommentType {
  TEXT = 'text',
  POLL = 'poll',
}

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

  @ManyToOne(() => User)
  @ApiProperty({ description: 'Autor do comentário' })
  user: User;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'ID do usuário' })
  userId: string;

  @ManyToOne(() => Comment, { nullable: true })
  @ApiProperty({ description: 'Comentário pai (em caso de resposta)' })
  parent: Comment;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Column('text')
  @ApiProperty({ description: 'Conteúdo do comentário' })
  content: string;

  @Column({
    name: 'comment_type',
    type: 'enum',
    enum: CommentType,
    default: CommentType.TEXT,
  })
  @ApiProperty({ description: 'Tipo do comentário', enum: CommentType })
  commentType: CommentType;

  @OneToMany(() => CommentPollOption, option => option.comment)
  @ApiProperty({ description: 'Opções da sub-enquete (se commentType = poll)' })
  pollOptions: CommentPollOption[];

  @OneToMany(() => CommentLike, like => like.comment)
  @ApiProperty({ description: 'Curtidas no comentário' })
  likes: CommentLike[];

  @Column({ name: 'likes_count', default: 0 })
  @ApiProperty({ description: 'Número de likes' })
  likesCount: number;

  @Column({ name: 'replies_count', default: 0 })
  @ApiProperty({ description: 'Número de respostas' })
  repliesCount: number;

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

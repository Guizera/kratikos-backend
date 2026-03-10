import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum NotificationType {
  POST_LIKE = 'post_like',
  COMMENT_ON_POST = 'comment_on_post',
  COMMENT_LIKE = 'comment_like',
  REPLY_TO_COMMENT = 'reply_to_comment',
  FOLLOW_REQUEST = 'follow_request',
  NEW_FOLLOWER = 'new_follower',
  POST_REPOST = 'post_repost',
  MENTION_IN_POST = 'mention_in_post',
  MENTION_IN_COMMENT = 'mention_in_comment',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único da notificação' })
  id: string;

  @Column({ name: 'recipient_id' })
  @ApiProperty({ description: 'ID do usuário que recebe a notificação' })
  recipientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  @ApiProperty({ type: () => User, description: 'Usuário que recebe a notificação' })
  recipient: User;

  @Column({ name: 'sender_id' })
  @ApiProperty({ description: 'ID do usuário que gerou a ação' })
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  @ApiProperty({ type: () => User, description: 'Usuário que gerou a ação' })
  sender: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  @ApiProperty({ description: 'Tipo da notificação', enum: NotificationType })
  type: NotificationType;

  @Column({ name: 'post_id', nullable: true })
  @ApiProperty({ description: 'ID do post relacionado (opcional)' })
  postId: string | null;

  @ManyToOne(() => Post, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'post_id' })
  @ApiProperty({ type: () => Post, description: 'Post relacionado (opcional)', required: false })
  post: Post | null;

  @Column({ name: 'comment_id', nullable: true })
  @ApiProperty({ description: 'ID do comentário relacionado (opcional)' })
  commentId: string | null;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'comment_id' })
  @ApiProperty({ type: () => Comment, description: 'Comentário relacionado (opcional)', required: false })
  comment: Comment | null;

  @Column({ nullable: true, type: 'text' })
  @ApiProperty({ description: 'Conteúdo da notificação' })
  content: string | null;

  @Column({ nullable: true, type: 'jsonb' })
  @ApiProperty({ description: 'Metadata adicional em JSON' })
  metadata: Record<string, any> | null;

  @Column({ name: 'is_read', default: false })
  @ApiProperty({ description: 'Se a notificação foi lida' })
  isRead: boolean;

  @Column({ name: 'read_at', nullable: true })
  @ApiProperty({ description: 'Quando foi lida' })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NewsArticle } from './news-article.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('news_shares')
export class NewsShare {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do compartilhamento' })
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Usuário que compartilhou (opcional)' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => NewsArticle, news => news.shares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'news_id' })
  @ApiProperty({ description: 'Notícia compartilhada' })
  news: NewsArticle;

  @Column({ name: 'news_id' })
  newsId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiProperty({ 
    description: 'Plataforma de compartilhamento', 
    example: 'whatsapp',
    enum: ['whatsapp', 'twitter', 'facebook', 'telegram', 'link', 'other']
  })
  platform: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data do compartilhamento' })
  createdAt: Date;
}


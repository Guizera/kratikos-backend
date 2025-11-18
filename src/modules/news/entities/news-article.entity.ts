import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { NewsLike } from './news-like.entity';
import { NewsShare } from './news-share.entity';

export enum NewsScope {
  INTERNACIONAL = 'internacional',
  NACIONAL = 'nacional',
  REGIONAL = 'regional',
}

@Entity('news_articles')
export class NewsArticle {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único da notícia' })
  id: string;

  @Column({ type: 'varchar', length: 500 })
  @ApiProperty({ description: 'Título da notícia' })
  title: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Descrição/resumo da notícia' })
  description: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Conteúdo completo da notícia' })
  content: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  @ApiProperty({ description: 'URL da imagem da notícia' })
  imageUrl: string;

  @Column({ name: 'source_name', type: 'varchar', length: 200 })
  @ApiProperty({ description: 'Nome da fonte da notícia' })
  sourceName: string;

  @Column({ name: 'source_url', type: 'text' })
  @ApiProperty({ description: 'URL original da notícia' })
  sourceUrl: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiProperty({ description: 'Autor da notícia' })
  author: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Categoria da notícia' })
  category: string;

  @Column({ type: 'text', array: true, default: '{}' })
  @ApiProperty({ description: 'Tags/palavras-chave da notícia' })
  tags: string[];

  @Column({
    type: 'enum',
    enum: NewsScope,
    default: NewsScope.NACIONAL,
  })
  @ApiProperty({ description: 'Escopo da notícia', enum: NewsScope })
  scope: NewsScope;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 8, nullable: true })
  @ApiProperty({ description: 'Latitude (para notícias regionais)' })
  locationLat: number;

  @Column({ name: 'location_lng', type: 'decimal', precision: 11, scale: 8, nullable: true })
  @ApiProperty({ description: 'Longitude (para notícias regionais)' })
  locationLng: number;

  @Column({ name: 'location_city', nullable: true })
  @ApiProperty({ description: 'Cidade (para notícias regionais)' })
  locationCity: string;

  @Column({ name: 'location_state', nullable: true })
  @ApiProperty({ description: 'Estado (para notícias regionais)' })
  locationState: string;

  @Column({ name: 'location_country', nullable: true, default: 'Brasil' })
  @ApiProperty({ description: 'País' })
  locationCountry: string;

  @Column({ name: 'published_at', type: 'timestamp with time zone' })
  @ApiProperty({ description: 'Data de publicação original' })
  publishedAt: Date;

  @Column({ name: 'fetched_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Data de captura da notícia' })
  fetchedAt: Date;

  @Column({ name: 'views_count', default: 0 })
  @ApiProperty({ description: 'Número de visualizações' })
  viewsCount: number;

  @Column({ name: 'likes_count', default: 0 })
  @ApiProperty({ description: 'Número de curtidas' })
  likesCount: number;

  @Column({ name: 'comments_count', default: 0 })
  @ApiProperty({ description: 'Número de comentários' })
  commentsCount: number;

  @Column({ name: 'shares_count', default: 0 })
  @ApiProperty({ description: 'Número de compartilhamentos' })
  sharesCount: number;

  @Column({ name: 'external_id', nullable: true })
  @ApiProperty({ description: 'ID externo da API de origem' })
  externalId: string;

  @Column({ type: 'varchar', length: 10, default: 'pt' })
  @ApiProperty({ description: 'Idioma da notícia' })
  language: string;

  @Column({ name: 'is_active', default: true })
  @ApiProperty({ description: 'Se a notícia está ativa' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação no banco' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Data de última atualização' })
  updatedAt: Date;

  // Relações
  @OneToMany(() => NewsLike, like => like.news)
  likes: NewsLike[];

  @OneToMany(() => NewsShare, share => share.news)
  shares: NewsShare[];
}


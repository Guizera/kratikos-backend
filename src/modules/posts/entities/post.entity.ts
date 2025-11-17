import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Category} from '../../categories/entities/category.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { PostScope } from '../dto/location.dto';

export enum PostType {
  PROPOSTA = 'proposta',
  DISCUSSAO = 'discussao',
  ENQUETE = 'enquete',
  VOTACAO = 'votacao',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do post' })
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  @ApiProperty({ description: 'Autor do post' })
  author: User;

  @Column({ name: 'author_id', nullable: true })
  authorId: string;

  @ManyToOne(() => Category, category => category.posts)
  @JoinColumn({ name: 'category_id' })
  @ApiProperty({ description: 'Categoria do post' })
  category: Category;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @Column({
    type: 'enum',
    enum: PostType,
  })
  @ApiProperty({ description: 'Tipo do post', enum: PostType })
  type: PostType;

  @Column()
  @ApiProperty({ description: 'Título do post' })
  title: string;

  @Column('text')
  @ApiProperty({ description: 'Conteúdo do post' })
  content: string;

  @Column({ name: 'image_url', nullable: true })
  @ApiProperty({ description: 'URL da imagem do post' })
  imageUrl: string;

  @Column({ default: 'ativo' })
  @ApiProperty({ description: 'Status do post' })
  status: string;

  @Column({ name: 'views_count', default: 0 })
  @ApiProperty({ description: 'Número de visualizações' })
  viewsCount: number;

  @Column({ name: 'likes_count', default: 0 })
  @ApiProperty({ description: 'Número de likes' })
  likesCount: number;

  @Column({ name: 'comments_count', default: 0 })
  @ApiProperty({ description: 'Número de comentários' })
  commentsCount: number;

  @Column({
    type: 'enum',
    enum: PostScope,
    default: PostScope.NACIONAL,
  })
  @ApiProperty({ description: 'Escopo do post', enum: PostScope })
  scope: PostScope;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 8, nullable: true })
  @ApiProperty({ description: 'Latitude (para posts regionais)' })
  locationLat: number;

  @Column({ name: 'location_lng', type: 'decimal', precision: 11, scale: 8, nullable: true })
  @ApiProperty({ description: 'Longitude (para posts regionais)' })
  locationLng: number;

  @Column({ name: 'location_range_km', nullable: true, default: 50 })
  @ApiProperty({ description: 'Range em quilômetros (para posts regionais)' })
  locationRangeKm: number;

  @Column({ name: 'location_city', nullable: true })
  @ApiProperty({ description: 'Cidade (para posts regionais)' })
  locationCity: string;

  @Column({ name: 'location_state', nullable: true })
  @ApiProperty({ description: 'Estado (para posts regionais)' })
  locationState: string;

  @Column({ name: 'location_country', nullable: true, default: 'Brasil' })
  @ApiProperty({ description: 'País' })
  locationCountry: string;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  @ApiProperty({ description: 'Tags do post' })
  tags: Tag[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

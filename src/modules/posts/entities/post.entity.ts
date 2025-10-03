import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Tag } from '../../tags/entities/tag.entity';

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

  @ManyToOne(() => User, { eager: true })
  @ApiProperty({ description: 'Autor do post' })
  author: User;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => Category, category => category.posts, { eager: true })
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

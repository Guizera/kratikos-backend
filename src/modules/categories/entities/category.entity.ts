import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../../posts/entities/post.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único da categoria' })
  id: string;

  @Column({ length: 100 })
  @ApiProperty({ description: 'Nome da categoria' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Descrição da categoria' })
  description: string;

  @Column({ name: 'icon_url', nullable: true })
  @ApiProperty({ description: 'URL do ícone da categoria' })
  iconUrl: string;

  @OneToMany(() => Post, post => post.category)
  posts: Post[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

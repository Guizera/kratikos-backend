import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../../posts/entities/post.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único da tag' })
  id: string;

  @Column({ length: 50, unique: true })
  @ApiProperty({ description: 'Nome da tag' })
  name: string;

  @ManyToMany(() => Post)
  posts: Post[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;
}

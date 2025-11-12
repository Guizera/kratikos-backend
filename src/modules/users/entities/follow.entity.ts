import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('follows')
@Unique(['followerId', 'followingId'])
@Index(['followerId'])
@Index(['followingId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do follow' })
  id: string;

  @Column({ name: 'follower_id' })
  @ApiProperty({ description: 'ID do usuário que está seguindo' })
  followerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  @ApiProperty({ description: 'Usuário que está seguindo' })
  follower: User;

  @Column({ name: 'following_id' })
  @ApiProperty({ description: 'ID do usuário que está sendo seguido' })
  followingId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  @ApiProperty({ description: 'Usuário que está sendo seguido' })
  following: User;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data em que começou a seguir' })
  createdAt: Date;
}


import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único do usuário' })
  id: string;

  @Column({ length: 100 })
  @ApiProperty({ description: 'Nome do usuário' })
  name: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Email do usuário' })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password_hash: string;

  @Column({ nullable: true, name: 'google_id' })
  @ApiProperty({ description: 'Google ID do usuário', required: false })
  googleId: string;

  @Column({ nullable: true, name: 'apple_id' })
  @ApiProperty({ description: 'Apple ID do usuário', required: false })
  appleId: string;

  @Column({ nullable: true, name: 'photo_url' })
  @ApiProperty({ description: 'URL da foto do perfil', required: false })
  photoUrl: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING
  })
  @ApiProperty({ description: 'Status do usuário', enum: UserStatus })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;

  // Método auxiliar para verificar se o usuário está ativo
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}

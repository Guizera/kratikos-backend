import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SocialProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
}

export class SocialAuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'ID do usuário no provedor social (Google/Apple)',
    example: '1234567890' 
  })
  providerId: string;

  @IsEnum(SocialProvider)
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Provedor de autenticação social',
    enum: SocialProvider,
    example: SocialProvider.GOOGLE 
  })
  provider: SocialProvider;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Email do usuário',
    example: 'joao@exemplo.com' 
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Nome do usuário',
    example: 'João da Silva' 
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ 
    description: 'URL da foto do perfil',
    example: 'https://lh3.googleusercontent.com/...',
    required: false
  })
  photoUrl?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Token de ID do provedor (para validação)',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjRk...' 
  })
  idToken: string;
}


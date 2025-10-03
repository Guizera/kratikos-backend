import { IsNotEmpty, IsString, IsEnum, IsUUID, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostType } from '../entities/post.entity';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Título do post',
    example: 'Proposta de melhoria no transporte público' 
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Conteúdo do post',
    example: 'Sugiro a implementação de novas linhas de ônibus...' 
  })
  content: string;

  @IsEnum(PostType)
  @ApiProperty({ 
    description: 'Tipo do post',
    enum: PostType,
    example: PostType.PROPOSTA 
  })
  type: PostType;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ 
    description: 'ID da categoria',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  categoryId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ 
    description: 'URL da imagem',
    example: 'https://exemplo.com/imagem.jpg' 
  })
  imageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({ 
    description: 'Tags do post',
    example: ['mobilidade', 'transporte'] 
  })
  tags?: string[];
}

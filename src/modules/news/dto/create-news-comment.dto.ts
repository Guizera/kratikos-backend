import { IsString, IsOptional, IsUUID, IsEnum, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NewsCommentType } from '../entities/news-comment.entity';

export class CreatePollOptionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @ApiProperty({ description: 'Texto da opção', example: 'Concordo' })
  optionText: string;

  @IsOptional()
  @ApiProperty({ description: 'Ordem de exibição', example: 0, required: false })
  displayOrder?: number;
}

export class CreateNewsCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  @ApiProperty({ description: 'Conteúdo do comentário', example: 'Ótima notícia!' })
  content: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'ID do comentário pai (para respostas)' })
  parentCommentId?: string;

  @IsOptional()
  @IsEnum(NewsCommentType)
  @ApiPropertyOptional({ 
    description: 'Tipo do comentário',
    enum: NewsCommentType,
    default: NewsCommentType.TEXT 
  })
  commentType?: NewsCommentType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePollOptionDto)
  @ArrayMinSize(2, { message: 'Sub-enquete deve ter no mínimo 2 opções' })
  @ArrayMaxSize(6, { message: 'Sub-enquete deve ter no máximo 6 opções' })
  @ApiPropertyOptional({ 
    description: 'Opções da sub-enquete (obrigatório se commentType = poll)',
    type: [CreatePollOptionDto]
  })
  pollOptions?: CreatePollOptionDto[];
}


import { IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentType } from '../entities/comment.entity';

export class CreateCommentPollOptionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @ApiProperty({ description: 'Texto da opção', example: 'Concordo' })
  optionText: string;

  @IsOptional()
  @ApiProperty({ description: 'Ordem de exibição', example: 0, required: false })
  displayOrder?: number;
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  @ApiProperty({ 
    description: 'Conteúdo do comentário',
    example: 'Concordo com a proposta, mas sugiro algumas alterações...' 
  })
  content: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'ID do post',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  postId: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ 
    description: 'ID do comentário pai (em caso de resposta)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  parentId?: string;

  @IsOptional()
  @IsEnum(CommentType)
  @ApiPropertyOptional({ 
    description: 'Tipo do comentário',
    enum: CommentType,
    default: CommentType.TEXT 
  })
  commentType?: CommentType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommentPollOptionDto)
  @ArrayMinSize(2, { message: 'Sub-enquete deve ter no mínimo 2 opções' })
  @ArrayMaxSize(6, { message: 'Sub-enquete deve ter no máximo 6 opções' })
  @ApiPropertyOptional({ 
    description: 'Opções da sub-enquete (obrigatório se commentType = poll)',
    type: [CreateCommentPollOptionDto]
  })
  pollOptions?: CreateCommentPollOptionDto[];
}

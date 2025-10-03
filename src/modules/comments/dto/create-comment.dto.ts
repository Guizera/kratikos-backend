import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
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
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  parentId?: string;
}

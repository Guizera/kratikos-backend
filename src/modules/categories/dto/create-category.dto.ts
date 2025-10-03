import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Nome da categoria',
    example: 'Infraestrutura' 
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ 
    description: 'Descrição da categoria',
    example: 'Discussões sobre infraestrutura urbana' 
  })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ 
    description: 'URL do ícone da categoria',
    example: 'https://exemplo.com/icone.png' 
  })
  iconUrl?: string;
}

import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsArray, IsDate, ArrayMinSize, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PostScope } from '../../posts/dto/location.dto';

export class PollLocationDto {
  @IsNumber()
  @ApiProperty({ description: 'Latitude' })
  lat: number;

  @IsNumber()
  @ApiProperty({ description: 'Longitude' })
  lng: number;

  @IsInt()
  @IsOptional()
  @ApiProperty({ description: 'Raio em KM', default: 50 })
  range_km?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Cidade' })
  city?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Estado' })
  state?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'País', default: 'Brasil' })
  country?: string;
}

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Pergunta da enquete',
    example: 'Qual o melhor horário para as reuniões comunitárias?' 
  })
  question: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ 
    description: 'Descrição adicional da enquete',
    example: 'Escolha o horário mais conveniente para a maioria' 
  })
  description?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiProperty({ 
    description: 'Data de término da enquete',
    example: '2024-12-31T23:59:59Z' 
  })
  endDate?: Date;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiProperty({ 
    description: 'Mínimo de opções que podem ser selecionadas',
    example: 1,
    default: 1 
  })
  minOptions?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiProperty({ 
    description: 'Máximo de opções que podem ser selecionadas',
    example: 1,
    default: 1 
  })
  maxOptions?: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  @ApiProperty({ 
    description: 'Opções da enquete',
    example: ['Manhã (8h-12h)', 'Tarde (14h-18h)', 'Noite (19h-21h)'] 
  })
  options: string[];

  @IsEnum(PostScope)
  @IsOptional()
  @ApiProperty({ 
    description: 'Escopo da enquete',
    enum: PostScope,
    default: PostScope.NACIONAL
  })
  scope?: PostScope;

  @ValidateNested()
  @Type(() => PollLocationDto)
  @IsOptional()
  @ApiProperty({ 
    description: 'Localização (obrigatório se scope = regional)',
    type: PollLocationDto
  })
  location?: PollLocationDto;
}

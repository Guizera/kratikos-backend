import { IsOptional, IsString, IsInt, Min, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { NewsScope } from '../entities/news-article.entity';

export class NewsQueryDto {
  @IsEnum(NewsScope)
  @IsOptional()
  @ApiProperty({
    description: 'Escopo das notícias',
    enum: NewsScope,
    required: false,
    example: NewsScope.NACIONAL,
  })
  scope?: NewsScope;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Categoria das notícias',
    example: 'politics',
    required: false,
  })
  category?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({
    description: 'Latitude (para notícias regionais)',
    example: -23.550520,
    required: false,
  })
  lat?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({
    description: 'Longitude (para notícias regionais)',
    example: -46.633308,
    required: false,
  })
  lng?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Range em KM (para notícias regionais)',
    example: 50,
    required: false,
    default: 50,
  })
  range?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Número da página',
    example: 1,
    required: false,
    default: 1,
  })
  page?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Quantidade de itens por página',
    example: 20,
    required: false,
    default: 20,
  })
  limit?: number;
}

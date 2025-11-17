import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PostScope {
  INTERNACIONAL = 'internacional',
  NACIONAL = 'nacional',
  REGIONAL = 'regional',
}

export class LocationDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  @ApiProperty({
    description: 'Latitude da localização',
    example: -23.550520,
    minimum: -90,
    maximum: 90,
  })
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  @ApiProperty({
    description: 'Longitude da localização',
    example: -46.633308,
    minimum: -180,
    maximum: 180,
  })
  lng: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(500)
  @ApiProperty({
    description: 'Range em quilômetros (raio de alcance)',
    example: 50,
    minimum: 1,
    maximum: 500,
    default: 50,
  })
  range_km?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
    required: false,
  })
  city?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Estado (sigla)',
    example: 'SP',
    required: false,
  })
  state?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'País',
    example: 'Brasil',
    required: false,
    default: 'Brasil',
  })
  country?: string;
}


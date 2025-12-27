import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'ID do post',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  post_id: string;

  @IsBoolean()
  @ApiProperty({ 
    description: 'Tipo de voto: true para positivo, false para negativo',
    example: true 
  })
  vote: boolean;

  @IsOptional()
  @ApiProperty({ 
    description: 'Fingerprint do dispositivo para controle anti-fraude',
    required: false 
  })
  device_fingerprint?: Record<string, any>;
}

export class SkipVoteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'ID do post',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  post_id: string;

  @IsOptional()
  @ApiProperty({ 
    description: 'Fingerprint do dispositivo para controle anti-fraude',
    required: false 
  })
  device_fingerprint?: Record<string, any>;
}


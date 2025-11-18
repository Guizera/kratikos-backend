import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShareNewsDto {
  @IsString()
  @IsOptional()
  @IsIn(['whatsapp', 'twitter', 'facebook', 'telegram', 'link', 'other'])
  @ApiProperty({
    description: 'Plataforma de compartilhamento',
    example: 'whatsapp',
    enum: ['whatsapp', 'twitter', 'facebook', 'telegram', 'link', 'other'],
    required: false,
  })
  platform?: string;
}


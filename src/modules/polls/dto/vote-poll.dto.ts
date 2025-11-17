import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VotePollDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID da opção escolhida',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  optionId: string;
}


import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FollowUserDto {
  @ApiProperty({ description: 'ID do usuário a ser seguido' })
  @IsUUID()
  userId: string;
}


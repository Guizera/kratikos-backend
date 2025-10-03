import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Email do usuário',
    example: 'joao@exemplo.com' 
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Senha do usuário',
    example: 'senha123' 
  })
  password: string;
}

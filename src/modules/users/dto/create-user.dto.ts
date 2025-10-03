import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Nome do usuário',
    example: 'João Silva' 
  })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Email do usuário',
    example: 'joao@exemplo.com' 
  })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ 
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senha123' 
  })
  password: string;
}

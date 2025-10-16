import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SocialAuthDto, SocialProvider } from './dto/social-auth.dto';
import { UserStatus } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.usersService.validatePassword(user, password)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive()) {
      throw new UnauthorizedException('Usuário inativo ou bloqueado');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
    };
  }

  async socialLogin(socialAuthDto: SocialAuthDto) {
    // TODO: Validar idToken com o provedor (Google/Apple)
    // Por enquanto, confiamos no token enviado pelo cliente
    
    // Buscar usuário existente por provider ID ou email
    let user = await this.findUserBySocialProvider(
      socialAuthDto.provider,
      socialAuthDto.providerId,
    );

    if (!user) {
      // Tentar encontrar por email
      user = await this.usersService.findByEmail(socialAuthDto.email);

      if (user) {
        // Vincular conta social ao usuário existente
        await this.linkSocialAccount(user, socialAuthDto);
      } else {
        // Criar novo usuário
        user = await this.createUserFromSocial(socialAuthDto);
      }
    }

    if (!user.isActive()) {
      throw new UnauthorizedException('Usuário inativo ou bloqueado');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
    };
  }

  private async findUserBySocialProvider(
    provider: SocialProvider,
    providerId: string,
  ) {
    if (provider === SocialProvider.GOOGLE) {
      return this.usersService.findByGoogleId(providerId);
    } else if (provider === SocialProvider.APPLE) {
      return this.usersService.findByAppleId(providerId);
    }
    return null;
  }

  private async linkSocialAccount(user: any, socialAuthDto: SocialAuthDto) {
    const updateData: any = {
      photoUrl: socialAuthDto.photoUrl || user.photoUrl,
    };

    if (socialAuthDto.provider === SocialProvider.GOOGLE) {
      updateData.googleId = socialAuthDto.providerId;
    } else if (socialAuthDto.provider === SocialProvider.APPLE) {
      updateData.appleId = socialAuthDto.providerId;
    }

    return this.usersService.update(user.id, updateData);
  }

  private async createUserFromSocial(socialAuthDto: SocialAuthDto) {
    const userData: any = {
      email: socialAuthDto.email,
      name: socialAuthDto.name,
      photoUrl: socialAuthDto.photoUrl,
      status: UserStatus.ACTIVE, // Usuários sociais já são ativados
    };

    if (socialAuthDto.provider === SocialProvider.GOOGLE) {
      userData.googleId = socialAuthDto.providerId;
    } else if (socialAuthDto.provider === SocialProvider.APPLE) {
      userData.appleId = socialAuthDto.providerId;
    }

    return this.usersService.createSocialUser(userData);
  }
}

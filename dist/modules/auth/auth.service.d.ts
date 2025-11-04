import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SocialAuthDto } from './dto/social-auth.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            photoUrl: any;
        };
    }>;
    socialLogin(socialAuthDto: SocialAuthDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            photoUrl: string;
        };
    }>;
    private findUserBySocialProvider;
    private linkSocialAccount;
    private createUserFromSocial;
}

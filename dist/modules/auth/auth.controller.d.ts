import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SocialAuthDto } from './dto/social-auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}

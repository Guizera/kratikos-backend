"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const social_auth_dto_1 = require("./dto/social-auth.dto");
const user_entity_1 = require("../users/entities/user.entity");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && await this.usersService.validatePassword(user, password)) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (!user.isActive()) {
            throw new common_1.UnauthorizedException('Usuário inativo ou bloqueado');
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
    async socialLogin(socialAuthDto) {
        let user = await this.findUserBySocialProvider(socialAuthDto.provider, socialAuthDto.providerId);
        if (!user) {
            user = await this.usersService.findByEmail(socialAuthDto.email);
            if (user) {
                await this.linkSocialAccount(user, socialAuthDto);
            }
            else {
                user = await this.createUserFromSocial(socialAuthDto);
            }
        }
        if (!user.isActive()) {
            throw new common_1.UnauthorizedException('Usuário inativo ou bloqueado');
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
    async findUserBySocialProvider(provider, providerId) {
        if (provider === social_auth_dto_1.SocialProvider.GOOGLE) {
            return this.usersService.findByGoogleId(providerId);
        }
        else if (provider === social_auth_dto_1.SocialProvider.APPLE) {
            return this.usersService.findByAppleId(providerId);
        }
        return null;
    }
    async linkSocialAccount(user, socialAuthDto) {
        const updateData = {
            photoUrl: socialAuthDto.photoUrl || user.photoUrl,
        };
        if (socialAuthDto.provider === social_auth_dto_1.SocialProvider.GOOGLE) {
            updateData.googleId = socialAuthDto.providerId;
        }
        else if (socialAuthDto.provider === social_auth_dto_1.SocialProvider.APPLE) {
            updateData.appleId = socialAuthDto.providerId;
        }
        return this.usersService.update(user.id, updateData);
    }
    async createUserFromSocial(socialAuthDto) {
        const userData = {
            email: socialAuthDto.email,
            name: socialAuthDto.name,
            photoUrl: socialAuthDto.photoUrl,
            status: user_entity_1.UserStatus.ACTIVE,
        };
        if (socialAuthDto.provider === social_auth_dto_1.SocialProvider.GOOGLE) {
            userData.googleId = socialAuthDto.providerId;
        }
        else if (socialAuthDto.provider === social_auth_dto_1.SocialProvider.APPLE) {
            userData.appleId = socialAuthDto.providerId;
        }
        return this.usersService.createSocialUser(userData);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
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
exports.SocialAuthDto = exports.SocialProvider = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var SocialProvider;
(function (SocialProvider) {
    SocialProvider["GOOGLE"] = "google";
    SocialProvider["APPLE"] = "apple";
})(SocialProvider || (exports.SocialProvider = SocialProvider = {}));
class SocialAuthDto {
}
exports.SocialAuthDto = SocialAuthDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'ID do usuário no provedor social (Google/Apple)',
        example: '1234567890'
    }),
    __metadata("design:type", String)
], SocialAuthDto.prototype, "providerId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SocialProvider),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'Provedor de autenticação social',
        enum: SocialProvider,
        example: SocialProvider.GOOGLE
    }),
    __metadata("design:type", String)
], SocialAuthDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'Email do usuário',
        example: 'joao@exemplo.com'
    }),
    __metadata("design:type", String)
], SocialAuthDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'Nome do usuário',
        example: 'João da Silva'
    }),
    __metadata("design:type", String)
], SocialAuthDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'URL da foto do perfil',
        example: 'https://lh3.googleusercontent.com/...',
        required: false
    }),
    __metadata("design:type", String)
], SocialAuthDto.prototype, "photoUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'Token de ID do provedor (para validação)',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjRk...'
    }),
    __metadata("design:type", String)
], SocialAuthDto.prototype, "idToken", void 0);
//# sourceMappingURL=social-auth.dto.js.map
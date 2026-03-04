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
exports.User = exports.UserStatus = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["PENDING"] = "pending";
    UserStatus["BLOCKED"] = "blocked";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
let User = class User {
    isActive() {
        return this.status === UserStatus.ACTIVE;
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'ID único do usuário' }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, swagger_1.ApiProperty)({ description: 'Nome do usuário' }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, swagger_1.ApiProperty)({ description: 'Email do usuário' }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "password_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'google_id' }),
    (0, swagger_1.ApiProperty)({ description: 'Google ID do usuário', required: false }),
    __metadata("design:type", String)
], User.prototype, "googleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'apple_id' }),
    (0, swagger_1.ApiProperty)({ description: 'Apple ID do usuário', required: false }),
    __metadata("design:type", String)
], User.prototype, "appleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'photo_url' }),
    (0, swagger_1.ApiProperty)({ description: 'URL da foto do perfil', required: false }),
    __metadata("design:type", String)
], User.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.PENDING
    }),
    (0, swagger_1.ApiProperty)({ description: 'Status do usuário', enum: UserStatus }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'cpf_hash' }),
    (0, class_transformer_1.Exclude)(),
    (0, swagger_1.ApiProperty)({ description: 'Hash SHA-256 do CPF', required: false }),
    __metadata("design:type", String)
], User.prototype, "cpfHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verification_level', default: 1 }),
    (0, swagger_1.ApiProperty)({ description: 'Nível de verificação: 1=Básica, 2=Verificada, 3=Legal' }),
    __metadata("design:type", Number)
], User.prototype, "verificationLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'document_verified', default: false }),
    (0, swagger_1.ApiProperty)({ description: 'Se documento foi verificado' }),
    __metadata("design:type", Boolean)
], User.prototype, "documentVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'document_verified_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data da verificação', required: false }),
    __metadata("design:type", Date)
], User.prototype, "documentVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_votes', default: 0 }),
    (0, swagger_1.ApiProperty)({ description: 'Total de votos do usuário' }),
    __metadata("design:type", Number)
], User.prototype, "totalVotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'consistent_voting_days', default: 0 }),
    (0, swagger_1.ApiProperty)({ description: 'Dias consecutivos votando' }),
    __metadata("design:type", Number)
], User.prototype, "consistentVotingDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'last_vote_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data do último voto', required: false }),
    __metadata("design:type", Date)
], User.prototype, "lastVoteAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de criação' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de atualização' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_entity_1 = require("./entities/user.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    findAll() {
        return this.usersService.findAll();
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    update(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
    async updateCpf(req, body) {
        await this.usersService.updateCpf(req.user.userId, body.cpf);
        return {
            message: 'CPF verificado com sucesso',
            verificationLevel: 2,
        };
    }
    async removeCpf(req) {
        await this.usersService.removeCpf(req.user.userId);
    }
    async getVerificationInfo(req) {
        return await this.usersService.getVerificationInfo(req.user.userId);
    }
    async getCurrentScore(req) {
        return await this.usersService.getCurrentScore(req.user.userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo usu?rio' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usu?rio criado com sucesso', type: user_entity_1.User }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inv?lidos' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email j? est? em uso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os usu?rios' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de usu?rios retornada', type: [user_entity_1.User] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar usu?rio por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usu?rio encontrado', type: user_entity_1.User }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usu?rio n?o encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar usu?rio' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usu?rio atualizado', type: user_entity_1.User }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usu?rio n?o encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remover usu?rio' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usu?rio removido' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usu?rio n?o encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('profile/cpf'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar CPF do usu?rio' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                cpf: {
                    type: 'string',
                    example: '123.456.789-00',
                    description: 'CPF com ou sem formata??o',
                },
            },
            required: ['cpf'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'CPF atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'CPF inv?lido ou j? cadastrado' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'N?o autorizado' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateCpf", null);
__decorate([
    (0, common_1.Delete)('profile/cpf'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remover CPF do usu?rio (volta para n?vel 1)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'CPF removido' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'N?o autorizado' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeCpf", null);
__decorate([
    (0, common_1.Get)('verification/info'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Informa??es de verifica??o do usu?rio' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Informa??es de verifica??o retornadas',
        schema: {
            type: 'object',
            properties: {
                verificationLevel: { type: 'number', example: 1 },
                levelName: { type: 'string', example: 'B?sica' },
                documentVerified: { type: 'boolean', example: false },
                verifiedAt: { type: 'string', format: 'date-time', nullable: true },
                benefits: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Votar em enquetes', 'Criar posts b?sicos'],
                },
                nextLevelInfo: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        level: { type: 'number' },
                        name: { type: 'string' },
                        requirements: { type: 'array', items: { type: 'string' } },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getVerificationInfo", null);
__decorate([
    (0, common_1.Get)('score/current'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Score e peso atual do usu?rio' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Score calculado retornado',
        schema: {
            type: 'object',
            properties: {
                baseScore: { type: 'number', example: 1.0 },
                verificationBonus: { type: 'number', example: 0.3 },
                historyScore: { type: 'number', example: 0.45 },
                consistencyScore: { type: 'number', example: 0.8 },
                finalScore: { type: 'number', example: 0.92 },
                weight: { type: 'number', example: 1.35 },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentScore", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map
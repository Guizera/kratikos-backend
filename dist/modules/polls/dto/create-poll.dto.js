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
exports.CreatePollDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreatePollDto {
}
exports.CreatePollDto = CreatePollDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'Pergunta da enquete',
        example: 'Qual o melhor horário para as reuniões comunitárias?'
    }),
    __metadata("design:type", String)
], CreatePollDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Descrição adicional da enquete',
        example: 'Escolha o horário mais conveniente para a maioria'
    }),
    __metadata("design:type", String)
], CreatePollDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Data de término da enquete',
        example: '2024-12-31T23:59:59Z'
    }),
    __metadata("design:type", Date)
], CreatePollDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Mínimo de opções que podem ser selecionadas',
        example: 1,
        default: 1
    }),
    __metadata("design:type", Number)
], CreatePollDto.prototype, "minOptions", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Máximo de opções que podem ser selecionadas',
        example: 1,
        default: 1
    }),
    __metadata("design:type", Number)
], CreatePollDto.prototype, "maxOptions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(2),
    (0, swagger_1.ApiProperty)({
        description: 'Opções da enquete',
        example: ['Manhã (8h-12h)', 'Tarde (14h-18h)', 'Noite (19h-21h)']
    }),
    __metadata("design:type", Array)
], CreatePollDto.prototype, "options", void 0);
//# sourceMappingURL=create-poll.dto.js.map
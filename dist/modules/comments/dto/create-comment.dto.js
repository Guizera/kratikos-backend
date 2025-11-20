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
exports.CreateCommentDto = exports.CreateCommentPollOptionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const comment_entity_1 = require("../entities/comment.entity");
class CreateCommentPollOptionDto {
}
exports.CreateCommentPollOptionDto = CreateCommentPollOptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    (0, swagger_1.ApiProperty)({ description: 'Texto da opção', example: 'Concordo' }),
    __metadata("design:type", String)
], CreateCommentPollOptionDto.prototype, "optionText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({ description: 'Ordem de exibição', example: 0, required: false }),
    __metadata("design:type", Number)
], CreateCommentPollOptionDto.prototype, "displayOrder", void 0);
class CreateCommentDto {
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(2000),
    (0, swagger_1.ApiProperty)({
        description: 'Conteúdo do comentário',
        example: 'Concordo com a proposta, mas sugiro algumas alterações...'
    }),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'ID do post',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "postId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'ID do comentário pai (em caso de resposta)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    }),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "parentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(comment_entity_1.CommentType),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo do comentário',
        enum: comment_entity_1.CommentType,
        default: comment_entity_1.CommentType.TEXT
    }),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "commentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateCommentPollOptionDto),
    (0, class_validator_1.ArrayMinSize)(2, { message: 'Sub-enquete deve ter no mínimo 2 opções' }),
    (0, class_validator_1.ArrayMaxSize)(6, { message: 'Sub-enquete deve ter no máximo 6 opções' }),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Opções da sub-enquete (obrigatório se commentType = poll)',
        type: [CreateCommentPollOptionDto]
    }),
    __metadata("design:type", Array)
], CreateCommentDto.prototype, "pollOptions", void 0);
//# sourceMappingURL=create-comment.dto.js.map
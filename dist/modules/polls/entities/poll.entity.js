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
exports.Poll = exports.PollStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const post_entity_1 = require("../../posts/entities/post.entity");
const poll_option_entity_1 = require("./poll-option.entity");
var PollStatus;
(function (PollStatus) {
    PollStatus["ABERTA"] = "aberta";
    PollStatus["FECHADA"] = "fechada";
    PollStatus["CANCELADA"] = "cancelada";
})(PollStatus || (exports.PollStatus = PollStatus = {}));
let Poll = class Poll {
    isActive() {
        const now = new Date();
        return (this.status === PollStatus.ABERTA &&
            (!this.endDate || this.endDate > now));
    }
};
exports.Poll = Poll;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'ID único da enquete' }),
    __metadata("design:type", String)
], Poll.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => post_entity_1.Post),
    (0, typeorm_1.JoinColumn)({ name: 'post_id' }),
    (0, swagger_1.ApiProperty)({ description: 'Post relacionado' }),
    __metadata("design:type", post_entity_1.Post)
], Poll.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'post_id' }),
    __metadata("design:type", String)
], Poll.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    (0, swagger_1.ApiProperty)({ description: 'Pergunta da enquete' }),
    __metadata("design:type", String)
], Poll.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'Descrição da enquete' }),
    __metadata("design:type", String)
], Poll.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PollStatus,
        default: PollStatus.ABERTA
    }),
    (0, swagger_1.ApiProperty)({ description: 'Status da enquete', enum: PollStatus }),
    __metadata("design:type", String)
], Poll.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'timestamp with time zone' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de início' }),
    __metadata("design:type", Date)
], Poll.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'timestamp with time zone', nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'Data de término' }),
    __metadata("design:type", Date)
], Poll.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_options', default: 1 }),
    (0, swagger_1.ApiProperty)({ description: 'Mínimo de opções que podem ser selecionadas' }),
    __metadata("design:type", Number)
], Poll.prototype, "minOptions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_options', default: 1 }),
    (0, swagger_1.ApiProperty)({ description: 'Máximo de opções que podem ser selecionadas' }),
    __metadata("design:type", Number)
], Poll.prototype, "maxOptions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => poll_option_entity_1.PollOption, option => option.poll, { eager: true }),
    (0, swagger_1.ApiProperty)({ description: 'Opções da enquete' }),
    __metadata("design:type", Array)
], Poll.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de criação' }),
    __metadata("design:type", Date)
], Poll.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de atualização' }),
    __metadata("design:type", Date)
], Poll.prototype, "updatedAt", void 0);
exports.Poll = Poll = __decorate([
    (0, typeorm_1.Entity)('polls')
], Poll);
//# sourceMappingURL=poll.entity.js.map
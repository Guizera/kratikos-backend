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
exports.PollOption = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const poll_entity_1 = require("./poll.entity");
let PollOption = class PollOption {
};
exports.PollOption = PollOption;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'ID único da opção' }),
    __metadata("design:type", String)
], PollOption.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => poll_entity_1.Poll, poll => poll.options),
    (0, swagger_1.ApiProperty)({ description: 'Enquete relacionada' }),
    __metadata("design:type", poll_entity_1.Poll)
], PollOption.prototype, "poll", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'poll_id' }),
    __metadata("design:type", String)
], PollOption.prototype, "pollId", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    (0, swagger_1.ApiProperty)({ description: 'Conteúdo da opção' }),
    __metadata("design:type", String)
], PollOption.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'votes_count', default: 0 }),
    (0, swagger_1.ApiProperty)({ description: 'Número de votos' }),
    __metadata("design:type", Number)
], PollOption.prototype, "votesCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de criação' }),
    __metadata("design:type", Date)
], PollOption.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de atualização' }),
    __metadata("design:type", Date)
], PollOption.prototype, "updatedAt", void 0);
exports.PollOption = PollOption = __decorate([
    (0, typeorm_1.Entity)('poll_options')
], PollOption);
//# sourceMappingURL=poll-option.entity.js.map
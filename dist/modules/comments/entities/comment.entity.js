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
exports.Comment = exports.CommentType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../users/entities/user.entity");
const post_entity_1 = require("../../posts/entities/post.entity");
const comment_poll_option_entity_1 = require("./comment-poll-option.entity");
const comment_like_entity_1 = require("./comment-like.entity");
var CommentType;
(function (CommentType) {
    CommentType["TEXT"] = "text";
    CommentType["POLL"] = "poll";
})(CommentType || (exports.CommentType = CommentType = {}));
let Comment = class Comment {
};
exports.Comment = Comment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'ID único do comentário' }),
    __metadata("design:type", String)
], Comment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => post_entity_1.Post, post => post.comments),
    (0, swagger_1.ApiProperty)({ description: 'Post relacionado' }),
    __metadata("design:type", post_entity_1.Post)
], Comment.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'post_id' }),
    __metadata("design:type", String)
], Comment.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    (0, swagger_1.ApiProperty)({ description: 'Autor do comentário' }),
    __metadata("design:type", user_entity_1.User)
], Comment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Comment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Comment, { nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'Comentário pai (em caso de resposta)' }),
    __metadata("design:type", Comment)
], Comment.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_id', nullable: true }),
    __metadata("design:type", String)
], Comment.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    (0, swagger_1.ApiProperty)({ description: 'Conteúdo do comentário' }),
    __metadata("design:type", String)
], Comment.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'comment_type',
        type: 'enum',
        enum: CommentType,
        default: CommentType.TEXT,
    }),
    (0, swagger_1.ApiProperty)({ description: 'Tipo do comentário', enum: CommentType }),
    __metadata("design:type", String)
], Comment.prototype, "commentType", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_poll_option_entity_1.CommentPollOption, option => option.comment),
    (0, swagger_1.ApiProperty)({ description: 'Opções da sub-enquete (se commentType = poll)' }),
    __metadata("design:type", Array)
], Comment.prototype, "pollOptions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_like_entity_1.CommentLike, like => like.comment),
    (0, swagger_1.ApiProperty)({ description: 'Curtidas no comentário' }),
    __metadata("design:type", Array)
], Comment.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'likes_count', default: 0 }),
    (0, swagger_1.ApiProperty)({ description: 'Número de likes' }),
    __metadata("design:type", Number)
], Comment.prototype, "likesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'replies_count', default: 0 }),
    (0, swagger_1.ApiProperty)({ description: 'Número de respostas' }),
    __metadata("design:type", Number)
], Comment.prototype, "repliesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_edited', default: false }),
    (0, swagger_1.ApiProperty)({ description: 'Indica se o comentário foi editado' }),
    __metadata("design:type", Boolean)
], Comment.prototype, "isEdited", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de criação' }),
    __metadata("design:type", Date)
], Comment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de atualização' }),
    __metadata("design:type", Date)
], Comment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comment, comment => comment.parent),
    __metadata("design:type", Array)
], Comment.prototype, "replies", void 0);
exports.Comment = Comment = __decorate([
    (0, typeorm_1.Entity)('comments')
], Comment);
//# sourceMappingURL=comment.entity.js.map
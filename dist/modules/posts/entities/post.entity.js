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
exports.Post = exports.PostType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../users/entities/user.entity");
const category_entity_1 = require("../../categories/entities/category.entity");
const comment_entity_1 = require("../../comments/entities/comment.entity");
const tag_entity_1 = require("../../tags/entities/tag.entity");
const location_dto_1 = require("../dto/location.dto");
var PostType;
(function (PostType) {
    PostType["PROPOSTA"] = "proposta";
    PostType["DISCUSSAO"] = "discussao";
    PostType["ENQUETE"] = "enquete";
    PostType["VOTACAO"] = "votacao";
})(PostType || (exports.PostType = PostType = {}));
let Post = class Post {
};
exports.Post = Post;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'ID único do post' }),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'author_id' }),
    (0, swagger_1.ApiProperty)({ description: 'Autor do post' }),
    __metadata("design:type", user_entity_1.User)
], Post.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'author_id', nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, category => category.posts),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    (0, swagger_1.ApiProperty)({ description: 'Categoria do post' }),
    __metadata("design:type", category_entity_1.Category)
], Post.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id', nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PostType,
    }),
    (0, swagger_1.ApiProperty)({ description: 'Tipo do post', enum: PostType }),
    __metadata("design:type", String)
], Post.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, swagger_1.ApiProperty)({ description: 'Título do post' }),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    (0, swagger_1.ApiProperty)({ description: 'Conteúdo do post' }),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_url', nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'URL da imagem do post' }),
    __metadata("design:type", String)
], Post.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ativo' }),
    (0, swagger_1.ApiProperty)({ description: 'Status do post' }),
    __metadata("design:type", String)
], Post.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'views_count', default: 0 }),
    (0, swagger_1.ApiProperty)({ description: 'Número de visualizações' }),
    __metadata("design:type", Number)
], Post.prototype, "viewsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'likes_count', default: 0 }),
    (0, swagger_1.ApiProperty)({ description: 'Número de likes' }),
    __metadata("design:type", Number)
], Post.prototype, "likesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comments_count', default: 0 }),
    (0, swagger_1.ApiProperty)({ description: 'Número de comentários' }),
    __metadata("design:type", Number)
], Post.prototype, "commentsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: location_dto_1.PostScope,
        default: location_dto_1.PostScope.NACIONAL,
    }),
    (0, swagger_1.ApiProperty)({ description: 'Escopo do post', enum: location_dto_1.PostScope }),
    __metadata("design:type", String)
], Post.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_lat', type: 'decimal', precision: 10, scale: 8, nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'Latitude (para posts regionais)' }),
    __metadata("design:type", Number)
], Post.prototype, "locationLat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_lng', type: 'decimal', precision: 11, scale: 8, nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'Longitude (para posts regionais)' }),
    __metadata("design:type", Number)
], Post.prototype, "locationLng", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_range_km', nullable: true, default: 50 }),
    (0, swagger_1.ApiProperty)({ description: 'Range em quilômetros (para posts regionais)' }),
    __metadata("design:type", Number)
], Post.prototype, "locationRangeKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_city', nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'Cidade (para posts regionais)' }),
    __metadata("design:type", String)
], Post.prototype, "locationCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_state', nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'Estado (para posts regionais)' }),
    __metadata("design:type", String)
], Post.prototype, "locationState", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_country', nullable: true, default: 'Brasil' }),
    (0, swagger_1.ApiProperty)({ description: 'País' }),
    __metadata("design:type", String)
], Post.prototype, "locationCountry", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, comment => comment.post),
    __metadata("design:type", Array)
], Post.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => tag_entity_1.Tag),
    (0, typeorm_1.JoinTable)({
        name: 'post_tags',
        joinColumn: { name: 'post_id' },
        inverseJoinColumn: { name: 'tag_id' },
    }),
    (0, swagger_1.ApiProperty)({ description: 'Tags do post' }),
    __metadata("design:type", Array)
], Post.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de criação' }),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    (0, swagger_1.ApiProperty)({ description: 'Data de atualização' }),
    __metadata("design:type", Date)
], Post.prototype, "updatedAt", void 0);
exports.Post = Post = __decorate([
    (0, typeorm_1.Entity)('posts')
], Post);
//# sourceMappingURL=post.entity.js.map
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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const post_entity_1 = require("./entities/post.entity");
const post_like_entity_1 = require("./entities/post-like.entity");
const location_dto_1 = require("./dto/location.dto");
let PostsService = class PostsService {
    constructor(postRepository, postLikeRepository) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
    }
    async create(createPostDto, authorId) {
        const { tags, location, scope, ...postData } = createPostDto;
        if (scope === location_dto_1.PostScope.REGIONAL && !location) {
            throw new common_1.BadRequestException('Localização é obrigatória para posts regionais');
        }
        const post = this.postRepository.create({
            ...postData,
            authorId,
            scope,
            locationLat: location?.lat,
            locationLng: location?.lng,
            locationRangeKm: location?.range_km || 50,
            locationCity: location?.city,
            locationState: location?.state,
            locationCountry: location?.country || 'Brasil',
        });
        const savedPost = await this.postRepository.save(post);
        const postWithRelations = await this.postRepository.findOne({
            where: { id: savedPost.id },
            relations: ['author', 'category', 'tags'],
        });
        return postWithRelations || savedPost;
    }
    async findAll(page = 1, limit = 10) {
        const [data, total] = await this.postRepository.findAndCount({
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['author', 'category', 'tags'],
        });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const post = await this.postRepository.findOne({
            where: { id },
            relations: ['author', 'category', 'tags', 'comments'],
        });
        if (!post) {
            throw new common_1.NotFoundException(`Post com ID ${id} não encontrado`);
        }
        post.viewsCount += 1;
        await this.postRepository.save(post);
        return post;
    }
    async update(id, updatePostDto) {
        const post = await this.findOne(id);
        Object.assign(post, updatePostDto);
        return this.postRepository.save(post);
    }
    async remove(id) {
        const post = await this.findOne(id);
        await this.postRepository.remove(post);
    }
    async findByAuthor(authorId, page = 1, limit = 10) {
        const [data, total] = await this.postRepository.findAndCount({
            where: { authorId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['author', 'category', 'tags'],
        });
        return { data, total };
    }
    async findByCategory(categoryId, page = 1, limit = 10) {
        const [data, total] = await this.postRepository.findAndCount({
            where: { categoryId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['author', 'tags'],
        });
        return { data, total };
    }
    async findInternationalPosts(page = 1, limit = 20) {
        const [data, total] = await this.postRepository.findAndCount({
            where: { scope: location_dto_1.PostScope.INTERNACIONAL },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['author', 'category', 'tags', 'poll', 'poll.options'],
        });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findNationalPosts(page = 1, limit = 20) {
        const [data, total] = await this.postRepository.findAndCount({
            where: { scope: location_dto_1.PostScope.NACIONAL },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['author', 'category', 'tags', 'poll', 'poll.options'],
        });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findRegionalPosts(lat, lng, range_km = 50, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const query = `
      SELECT * FROM (
        SELECT 
          p.*,
          u.name as "authorName",
          u.email as "authorEmail",
          u.photo_url as "authorPhotoUrl",
          (6371 * acos(
            cos(radians($1)) * cos(radians(p.location_lat)) *
            cos(radians(p.location_lng) - radians($2)) +
            sin(radians($1)) * sin(radians(p.location_lat))
          )) AS distance
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.scope = 'regional'
          AND p.location_lat IS NOT NULL
          AND p.location_lng IS NOT NULL
      ) AS posts_with_distance
      WHERE distance <= $3
      ORDER BY created_at DESC
      LIMIT $4 OFFSET $5
    `;
        const posts = await this.postRepository.query(query, [
            lat,
            lng,
            range_km,
            limit,
            skip,
        ]);
        const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT 
          p.*,
          (6371 * acos(
            cos(radians($1)) * cos(radians(p.location_lat)) *
            cos(radians(p.location_lng) - radians($2)) +
            sin(radians($1)) * sin(radians(p.location_lat))
          )) AS distance
        FROM posts p
        WHERE p.scope = 'regional'
          AND p.location_lat IS NOT NULL
          AND p.location_lng IS NOT NULL
      ) AS subquery
      WHERE distance <= $3
    `;
        const [{ total }] = await this.postRepository.query(countQuery, [
            lat,
            lng,
            range_km,
        ]);
        return {
            data: posts,
            total: parseInt(total),
            page,
            limit,
        };
    }
    async likePost(postId, userId) {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) {
            throw new common_1.NotFoundException('Post não encontrado');
        }
        const existingLike = await this.postLikeRepository.findOne({
            where: { postId, userId },
        });
        if (existingLike) {
            throw new common_1.BadRequestException('Você já curtiu este post');
        }
        const like = this.postLikeRepository.create({ postId, userId });
        await this.postLikeRepository.save(like);
        await this.postRepository.increment({ id: postId }, 'likesCount', 1);
    }
    async unlikePost(postId, userId) {
        const like = await this.postLikeRepository.findOne({
            where: { postId, userId },
        });
        if (!like) {
            throw new common_1.NotFoundException('Like não encontrado');
        }
        await this.postLikeRepository.remove(like);
        await this.postRepository.decrement({ id: postId }, 'likesCount', 1);
    }
    async hasUserLikedPost(postId, userId) {
        const like = await this.postLikeRepository.findOne({
            where: { postId, userId },
        });
        return !!like;
    }
    async sharePost(postId) {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) {
            throw new common_1.NotFoundException('Post não encontrado');
        }
        await this.postRepository.increment({ id: postId }, 'sharesCount', 1);
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(1, (0, typeorm_1.InjectRepository)(post_like_entity_1.PostLike)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PostsService);
//# sourceMappingURL=posts.service.js.map
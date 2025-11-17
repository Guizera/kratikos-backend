import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostScope } from './dto/location.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    const { tags, location, scope, ...postData } = createPostDto;
    
    // Validar: se scope = regional, location é obrigatória
    if (scope === PostScope.REGIONAL && !location) {
      throw new BadRequestException(
        'Localização é obrigatória para posts regionais'
      );
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
    
    // Recarregar com relações para retornar o autor
    const postWithRelations = await this.postRepository.findOne({
      where: { id: savedPost.id },
      relations: ['author', 'category', 'tags'],
    });
    
    // Se author for null por algum motivo, retornar sem ele
    return postWithRelations || savedPost;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Post[]; total: number; page: number; limit: number }> {
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

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'tags', 'comments'],
    });

    if (!post) {
      throw new NotFoundException(`Post com ID ${id} não encontrado`);
    }

    // Incrementar visualizações
    post.viewsCount += 1;
    await this.postRepository.save(post);

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }

  async findByAuthor(authorId: string, page: number = 1, limit: number = 10): Promise<{ data: Post[]; total: number }> {
    const [data, total] = await this.postRepository.findAndCount({
      where: { authorId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['category', 'tags'],
    });

    return { data, total };
  }

  async findByCategory(categoryId: string, page: number = 1, limit: number = 10): Promise<{ data: Post[]; total: number }> {
    const [data, total] = await this.postRepository.findAndCount({
      where: { categoryId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author', 'tags'],
    });

    return { data, total };
  }

  // NOVO: Buscar posts internacionais
  async findInternationalPosts(page: number = 1, limit: number = 20): Promise<{ data: Post[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.postRepository.findAndCount({
      where: { scope: PostScope.INTERNACIONAL },
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

  // NOVO: Buscar posts nacionais
  async findNationalPosts(page: number = 1, limit: number = 20): Promise<{ data: Post[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.postRepository.findAndCount({
      where: { scope: PostScope.NACIONAL },
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

  // NOVO: Buscar posts regionais (por localização)
  async findRegionalPosts(
    lat: number,
    lng: number,
    range_km: number = 50,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    // Fórmula Haversine para calcular distância
    // 6371 = raio da Terra em km
    const query = `
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
      HAVING distance <= $3
      ORDER BY p.created_at DESC
      LIMIT $4 OFFSET $5
    `;
    
    const posts = await this.postRepository.query(query, [
      lat,
      lng,
      range_km,
      limit,
      skip,
    ]);
    
    // Buscar total
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
}


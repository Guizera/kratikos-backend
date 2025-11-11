import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    const { tags, ...postData } = createPostDto;
    
    const post = this.postRepository.create({
      ...postData,
      authorId,
    });
    
    const savedPost = await this.postRepository.save(post);
    
    // Recarregar com relações para retornar o autor
    return await this.postRepository.findOne({
      where: { id: savedPost.id },
      relations: ['author', 'category', 'tags'],
    });
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
}


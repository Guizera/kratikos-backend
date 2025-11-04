import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsService {
    private readonly postRepository;
    constructor(postRepository: Repository<Post>);
    create(createPostDto: CreatePostDto, authorId: string): Promise<Post>;
    findAll(page?: number, limit?: number): Promise<{
        data: Post[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Post>;
    update(id: string, updatePostDto: UpdatePostDto): Promise<Post>;
    remove(id: string): Promise<void>;
    findByAuthor(authorId: string, page?: number, limit?: number): Promise<{
        data: Post[];
        total: number;
    }>;
    findByCategory(categoryId: string, page?: number, limit?: number): Promise<{
        data: Post[];
        total: number;
    }>;
}

import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    getFeed(page: number, limit: number): Promise<{
        data: import("./entities/post.entity").Post[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(createPostDto: CreatePostDto, req: any): Promise<import("./entities/post.entity").Post>;
    getRemainingPosts(): Promise<{
        remaining: number;
    }>;
    findAll(page: number, limit: number): Promise<{
        data: import("./entities/post.entity").Post[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./entities/post.entity").Post>;
    update(id: string, updatePostDto: UpdatePostDto): Promise<import("./entities/post.entity").Post>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findByAuthor(authorId: string, page: number, limit: number): Promise<{
        data: import("./entities/post.entity").Post[];
        total: number;
    }>;
    findByCategory(categoryId: string, page: number, limit: number): Promise<{
        data: import("./entities/post.entity").Post[];
        total: number;
    }>;
    findInternational(page: number, limit: number): Promise<{
        data: import("./entities/post.entity").Post[];
        total: number;
        page: number;
        limit: number;
    }>;
    findNational(page: number, limit: number): Promise<{
        data: import("./entities/post.entity").Post[];
        total: number;
        page: number;
        limit: number;
    }>;
    findRegional(lat: string, lng: string, range: number, page: number, limit: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    likePost(id: string, req: any): Promise<{
        message: string;
    }>;
    unlikePost(id: string, req: any): Promise<{
        message: string;
    }>;
    hasLiked(id: string, req: any): Promise<{
        hasLiked: boolean;
    }>;
    sharePost(id: string): Promise<{
        message: string;
    }>;
}

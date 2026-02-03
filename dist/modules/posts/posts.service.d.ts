import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { SavedPost } from './entities/saved-post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsService {
    private readonly postRepository;
    private readonly postLikeRepository;
    private readonly savedPostRepository;
    constructor(postRepository: Repository<Post>, postLikeRepository: Repository<PostLike>, savedPostRepository: Repository<SavedPost>);
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
    findInternationalPosts(page?: number, limit?: number): Promise<{
        data: Post[];
        total: number;
        page: number;
        limit: number;
    }>;
    findNationalPosts(page?: number, limit?: number): Promise<{
        data: Post[];
        total: number;
        page: number;
        limit: number;
    }>;
    findRegionalPosts(lat: number, lng: number, range_km?: number, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    likePost(postId: string, userId: string): Promise<void>;
    unlikePost(postId: string, userId: string): Promise<void>;
    hasUserLikedPost(postId: string, userId: string): Promise<boolean>;
    sharePost(postId: string): Promise<void>;
    savePost(postId: string, userId: string): Promise<void>;
    unsavePost(postId: string, userId: string): Promise<void>;
    hasUserSavedPost(postId: string, userId: string): Promise<boolean>;
    getSavedPosts(userId: string, page?: number, limit?: number): Promise<{
        posts: Post[];
        total: number;
    }>;
}

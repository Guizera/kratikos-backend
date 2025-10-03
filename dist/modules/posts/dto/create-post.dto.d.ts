import { PostType } from '../entities/post.entity';
export declare class CreatePostDto {
    title: string;
    content: string;
    type: PostType;
    categoryId?: string;
    imageUrl?: string;
    tags?: string[];
}

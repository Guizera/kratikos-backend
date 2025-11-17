import { PostType } from '../entities/post.entity';
import { PostScope, LocationDto } from './location.dto';
export declare class CreatePostDto {
    title: string;
    content: string;
    type: PostType;
    categoryId?: string;
    imageUrl?: string;
    tags?: string[];
    scope: PostScope;
    location?: LocationDto;
}

import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { PostScope } from '../dto/location.dto';
export declare enum PostType {
    PROPOSTA = "proposta",
    DISCUSSAO = "discussao",
    ENQUETE = "enquete",
    VOTACAO = "votacao"
}
export declare class Post {
    id: string;
    author: User;
    authorId: string;
    category: Category;
    categoryId: string;
    type: PostType;
    title: string;
    content: string;
    imageUrl: string;
    status: string;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    scope: PostScope;
    locationLat: number;
    locationLng: number;
    locationRangeKm: number;
    locationCity: string;
    locationState: string;
    locationCountry: string;
    comments: Comment[];
    tags: Tag[];
    createdAt: Date;
    updatedAt: Date;
}

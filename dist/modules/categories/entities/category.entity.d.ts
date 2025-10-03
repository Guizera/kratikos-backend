import { Post } from '../../posts/entities/post.entity';
export declare class Category {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    posts: Post[];
    createdAt: Date;
    updatedAt: Date;
}

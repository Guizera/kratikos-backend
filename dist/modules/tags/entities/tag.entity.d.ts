import { Post } from '../../posts/entities/post.entity';
export declare class Tag {
    id: string;
    name: string;
    posts: Post[];
    createdAt: Date;
}

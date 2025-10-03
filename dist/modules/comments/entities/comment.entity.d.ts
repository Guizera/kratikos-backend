import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
export declare class Comment {
    id: string;
    post: Post;
    postId: string;
    user: User;
    userId: string;
    parent: Comment;
    parentId: string;
    content: string;
    likesCount: number;
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
    replies: Comment[];
}

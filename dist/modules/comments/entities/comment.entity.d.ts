import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { CommentPollOption } from './comment-poll-option.entity';
import { CommentLike } from './comment-like.entity';
export declare enum CommentType {
    TEXT = "text",
    POLL = "poll"
}
export declare class Comment {
    id: string;
    post: Post;
    postId: string;
    user: User;
    userId: string;
    parent: Comment;
    parentId: string;
    content: string;
    commentType: CommentType;
    pollOptions: CommentPollOption[];
    likes: CommentLike[];
    likesCount: number;
    repliesCount: number;
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
    replies: Comment[];
}

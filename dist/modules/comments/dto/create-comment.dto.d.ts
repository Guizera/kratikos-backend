import { CommentType } from '../entities/comment.entity';
export declare class CreateCommentPollOptionDto {
    optionText: string;
    displayOrder?: number;
}
export declare class CreateCommentDto {
    content: string;
    postId: string;
    parentId?: string;
    commentType?: CommentType;
    pollOptions?: CreateCommentPollOptionDto[];
}

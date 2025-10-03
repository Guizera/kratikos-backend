import { Post } from '../../posts/entities/post.entity';
import { PollOption } from './poll-option.entity';
export declare enum PollStatus {
    ABERTA = "aberta",
    FECHADA = "fechada",
    CANCELADA = "cancelada"
}
export declare class Poll {
    id: string;
    post: Post;
    postId: string;
    question: string;
    description: string;
    status: PollStatus;
    startDate: Date;
    endDate: Date;
    minOptions: number;
    maxOptions: number;
    options: PollOption[];
    createdAt: Date;
    updatedAt: Date;
    isActive(): boolean;
}

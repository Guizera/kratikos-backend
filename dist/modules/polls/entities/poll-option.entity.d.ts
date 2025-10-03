import { Poll } from './poll.entity';
export declare class PollOption {
    id: string;
    poll: Poll;
    pollId: string;
    content: string;
    votesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

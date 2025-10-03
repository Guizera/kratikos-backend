export declare class CreatePollDto {
    question: string;
    description?: string;
    endDate?: Date;
    minOptions?: number;
    maxOptions?: number;
    options: string[];
}

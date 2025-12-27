import { PostScope } from '../../posts/dto/location.dto';
export declare class PollLocationDto {
    lat: number;
    lng: number;
    range_km?: number;
    city?: string;
    state?: string;
    country?: string;
}
export declare class CreatePollDto {
    question: string;
    description?: string;
    endDate?: Date;
    minOptions?: number;
    maxOptions?: number;
    options: string[];
    scope?: PostScope;
    location?: PollLocationDto;
}

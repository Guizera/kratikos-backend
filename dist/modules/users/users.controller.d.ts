import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    updateCpf(req: any, body: {
        cpf: string;
    }): Promise<{
        message: string;
        verificationLevel: number;
    }>;
    removeCpf(req: any): Promise<void>;
    getVerificationInfo(req: any): Promise<{
        verificationLevel: number;
        levelName: string;
        documentVerified: boolean;
        verifiedAt: Date | null;
        benefits: string[];
        nextLevelInfo?: {
            level: number;
            name: string;
            requirements: string[];
        };
    }>;
    getCurrentScore(req: any): Promise<import("../scoring/simple-scoring.service").UserScore>;
}

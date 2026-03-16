import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SimpleScoringService } from '../scoring/simple-scoring.service';
export declare class UsersService {
    private usersRepository;
    private readonly scoringService;
    constructor(usersRepository: Repository<User>, scoringService: SimpleScoringService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    validatePassword(user: User, password: string): Promise<boolean>;
    findByGoogleId(googleId: string): Promise<User | null>;
    findByAppleId(appleId: string): Promise<User | null>;
    createSocialUser(userData: Partial<User>): Promise<User>;
    private hashCpf;
    private isValidCpf;
    updateCpf(userId: string, cpf: string): Promise<void>;
    getVerificationInfo(userId: string): Promise<{
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
    removeCpf(userId: string): Promise<void>;
    getCurrentScore(userId: string): Promise<import("../scoring/simple-scoring.service").UserScore>;
    getPersonalStats(userId: string): Promise<{
        totalVotes: number;
        consistentStreak: number;
        lastVoteAt: Date;
        accountAge: number;
        currentScore: import("../scoring/simple-scoring.service").UserScore;
        ranking: {
            position: any;
            total: number;
            percentile: string;
        };
        dailyActivity: any;
    }>;
}

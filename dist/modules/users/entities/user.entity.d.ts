export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    BLOCKED = "blocked"
}
export declare class User {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    isActive(): boolean;
}

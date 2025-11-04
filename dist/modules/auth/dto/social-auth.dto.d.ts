export declare enum SocialProvider {
    GOOGLE = "google",
    APPLE = "apple"
}
export declare class SocialAuthDto {
    providerId: string;
    provider: SocialProvider;
    email: string;
    name: string;
    photoUrl?: string;
    idToken: string;
}

declare const _default: (() => {
    port: number;
    environment: string;
    cors: {
        origin: string[];
        credentials: boolean;
    };
    upload: {
        maxFileSize: number;
        uploadPath: string;
    };
    swagger: {
        enabled: boolean;
        title: string;
        description: string;
        version: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    environment: string;
    cors: {
        origin: string[];
        credentials: boolean;
    };
    upload: {
        maxFileSize: number;
        uploadPath: string;
    };
    swagger: {
        enabled: boolean;
        title: string;
        description: string;
        version: string;
    };
}>;
export default _default;

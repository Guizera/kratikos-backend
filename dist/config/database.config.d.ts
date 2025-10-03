declare const _default: (() => {
    url: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
}>;
export default _default;

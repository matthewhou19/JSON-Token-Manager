interface JsonTokenConfig {
    tokenUrl: string;
    body: object;
    header_list: {
        [key: string]: string;
    };
    tokenField: string;
    expireField: string;
    retryAttempts?: number;
    retryDelay?: number;
    bufferTime?: number;
}
export default class JsonTokenManager {
    private config;
    private token;
    private expireTime;
    private isRefreshing;
    private refreshPromise;
    constructor(config: JsonTokenConfig);
    getToken(): Promise<string>;
    private refreshToken;
}
export {};

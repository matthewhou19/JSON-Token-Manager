"use strict";
// 1. only open one method to get token
// 2. manage liefe cycle of token automatically (e.g. refresh token)
// TODO 3. save the credential security
// 4. support multiple token sources
// TODO 5. save the token security
// TODO 6. we may need to access the token very frequently, so we need to cache the token
// 7. error handling
// 8. feild manully requried 1. expireTime 2. token name
// 9. Retry Mechanism:
// 10. Token Expiry Check Precision: we should refresh the TOKEN before it expires
//TODO 11. Concurrency QUEUE
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class JsonTokenManager {
    constructor(config) {
        this.token = null;
        this.expireTime = null;
        this.isRefreshing = false;
        this.refreshPromise = null;
        if (!config.tokenUrl || !config.tokenField || !config.expireField) {
            throw new Error("Invalid configuration");
        }
        this.config = config;
    }
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const bufferTime = this.config.bufferTime || 60000; // Default buffer time of 1 minute
            if (this.token === null ||
                this.expireTime === null ||
                this.expireTime < Date.now() + bufferTime) {
                if (this.isRefreshing) {
                    if (this.refreshPromise)
                        yield this.refreshPromise;
                }
                else {
                    this.refreshPromise = this.refreshToken();
                    yield this.refreshPromise;
                }
            }
            if (!this.token) {
                throw new Error("Failed to obtain token");
            }
            return this.token;
        });
    }
    refreshToken() {
        return __awaiter(this, arguments, void 0, function* (attempts = 0) {
            this.isRefreshing = true;
            try {
                const response = yield axios_1.default.post(this.config.tokenUrl, this.config.body, {
                    headers: this.config.header_list,
                });
                if (response.status !== 200) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data = response.data;
                this.token = data[this.config.tokenField];
                this.expireTime = Date.now() + data[this.config.expireField] * 1000;
            }
            catch (error) {
                console.error("Failed to refresh token:", error);
                const retryAttempts = this.config.retryAttempts || 3;
                if (attempts < retryAttempts) {
                    const retryDelay = this.config.retryDelay || 1000; // Default retry delay of 1 second
                    yield new Promise((res) => setTimeout(res, retryDelay));
                    return this.refreshToken(attempts + 1);
                }
                else {
                    throw new Error("Max retry attempts reached for token refresh");
                }
            }
            finally {
                this.isRefreshing = false;
                this.refreshPromise = null;
            }
        });
    }
}
exports.default = JsonTokenManager;

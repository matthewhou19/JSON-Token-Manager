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

import axios from "axios";

interface JsonTokenConfig {
  tokenUrl: string;
  body: object;
  header_list: { [key: string]: string };
  tokenField: string; // Field name for the token
  expireField: string; // Field name for the expiration time in seconds
  retryAttempts?: number; // Number of retry attempts for token refresh
  retryDelay?: number; // Delay between retry attempts in milliseconds
  bufferTime?: number; // Buffer time in milliseconds to refresh token before expiry
}

interface TokenResponse {
  [key: string]: any; // Define keys based on the response structure
}

export default class JsonTokenManager {
  private config: JsonTokenConfig;
  private token: string | null = null;
  private expireTime: number | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(config: JsonTokenConfig) {
    if (!config.tokenUrl || !config.tokenField || !config.expireField) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  public async getToken(): Promise<string> {
    const bufferTime = this.config.bufferTime || 60000; // Default buffer time of 1 minute
    if (
      this.token === null ||
      this.expireTime === null ||
      this.expireTime < Date.now() + bufferTime
    ) {
      if (this.isRefreshing) {
        if (this.refreshPromise) await this.refreshPromise;
      } else {
        this.refreshPromise = this.refreshToken();
        await this.refreshPromise;
      }
    }
    if (!this.token) {
      throw new Error("Failed to obtain token");
    }
    return this.token!;
  }
  public async manualRefresh(): Promise<void> {
    try {
      await this.refreshToken();
      console.log("Token refreshed successfully.");
    } catch (error) {
      console.error("Failed to manually refresh token:", error);
    }
  }

  private async refreshToken(attempts: number = 0): Promise<void> {
    this.isRefreshing = true;
    try {
      const response = await axios.post<TokenResponse>(
        this.config.tokenUrl,
        this.config.body,
        {
          headers: this.config.header_list,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = response.data;
      this.token = data[this.config.tokenField];
      this.expireTime = Date.now() + data[this.config.expireField] * 1000;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      const retryAttempts = this.config.retryAttempts || 3;
      if (attempts < retryAttempts) {
        const retryDelay = this.config.retryDelay || 1000; // Default retry delay of 1 second
        await new Promise((res) => setTimeout(res, retryDelay));
        return this.refreshToken(attempts + 1);
      } else {
        throw new Error("Max retry attempts reached for token refresh");
      }
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }
}

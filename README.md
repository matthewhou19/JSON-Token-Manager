# JsonTokenManager

JsonTokenManager is a TypeScript library for managing API tokens. It handles token storage, lifecycle management, and automatic refreshing, supporting multiple retry attempts and customizable configurations.

## Overview

JsonTokenManager simplifies the management of API tokens by automating the refresh process and handling token expiration seamlessly. The library is designed to be configurable, allowing you to tailor it to your specific API requirements. Key features include automatic token refreshing, support for various configuration options, and the ability to manually refresh tokens when needed. Future improvements will include optimized storage solutions, enhanced security measures, concurrent queue management, and token caching.


## Contributing

Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue on GitHub. Feel free to fork the repository and submit pull requests for any enhancements or bug fixes.


## Features

- Automatic token refreshing based on expiration time.
- Configurable retry logic for token refresh attempts.
- Support for customizable request headers and body.
- Buffer time to refresh tokens before they expire.
- Manual token refresh capability.


## Unimplemented Features

1. **Optimized Storage** : Improve storage by moving credentials and tokens out of memory to a more secure and efficient storage solution.
2. **Enhanced Security** : Implement additional security measures for storing and handling tokens and credentials.
3. **Concurrent Queue Management** : Introduce a concurrent queue to handle multiple token queries efficiently.
4. **Token Caching** : Implement a caching mechanism to store and retrieve tokens efficiently, reducing unnecessary token refresh requests.

## Installation

Install the package using npm:

```sh
npm install json-token-manager
```

## Usage

### Import the JsonTokenManager

Import the `JsonTokenManager` class in your TypeScript file:

```typescript
import JsonTokenManager from 'json-token-manager';
```

### Configure the Token Manager

Create a configuration object with the necessary details:

```typescript
const config = {
  tokenUrl: 'https://api.example.com/oauth/token',
  body: {
    grant_type: 'client_credentials',
    client_id: 'your-client-id',
    client_secret: 'your-client-secret'
  },
  header_list: {
    'Content-Type': 'application/json'
  },
  tokenField: 'access_token',
  expireField: 'expires_in',
  retryAttempts: 3, // Optional, default is 3
  retryDelay: 1000, // Optional, default is 1000ms
  bufferTime: 60000 // Optional, default is 60000ms (1 minute)
};
```

### Initialize the Token Manager

Create an instance of `JsonTokenManager` with the configuration:

```typescript
const tokenManager = new JsonTokenManager(config);
```

### Get a Token

Use the `getToken` method to obtain a valid token. This method will refresh the token if it is expired or about to expire.

```typescript
const token = await tokenManager.getToken();
console.log(token);
```

### Manual Token Refresh

If needed, you can manually refresh the token using the `manualRefresh` method:

```typescript
await tokenManager.manualRefresh();
```

### Example

Here's a complete example of using `JsonTokenManager` to make an API request:

```typescript
import JsonTokenManager from 'json-token-manager';
import axios from 'axios';

const config = {
  tokenUrl: 'https://api.example.com/oauth/token',
  body: {
    grant_type: 'client_credentials',
    client_id: 'your-client-id',
    client_secret: 'your-client-secret'
  },
  header_list: {
    'Content-Type': 'application/json'
  },
  tokenField: 'access_token',
  expireField: 'expires_in'
};

const tokenManager = new JsonTokenManager(config);

(async () => {
  try {
    const token = await tokenManager.getToken();

    const response = await axios.get('https://api.example.com/resource', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(response.data);
  } catch (error) {
    console.error('Error making API request:', error);
  }
})();
```

## Configuration Options

- `tokenUrl`: The URL to request a new token.
- `body`: The body of the token request.
- `header_list`: Headers for the token request.
- `tokenField`: The field in the response containing the token.
- `expireField`: The field in the response containing the expiration time (in seconds).
- `retryAttempts`: (Optional) Number of retry attempts for token refresh (default is 3).
- `retryDelay`: (Optional) Delay between retry attempts in milliseconds (default is 1000ms).
- `bufferTime`: (Optional) Buffer time in milliseconds to refresh token before expiry (default is 60000ms or 1 minute).

## Error Handling

If the token refresh fails, the `JsonTokenManager` will retry based on the configured `retryAttempts` and `retryDelay`. If all attempts fail, an error is thrown.

## License

This project is licensed under the MIT License.

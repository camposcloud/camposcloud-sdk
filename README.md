# CamposCloud SDK

A TypeScript/JavaScript SDK for interacting with the CamposCloud API. This SDK provides a simple and intuitive way to manage applications, upload files, and perform various operations on the CamposCloud platform.

You can see the full API documentation at [API Docs](https://docs.camposcloud.com).

## Installation

```bash
npm install @camposcloud/sdk
```

## Getting Started

First, you need to obtain an API token from your CamposCloud dashboard. Then initialize the SDK:

```typescript
import CamposCloudSDK from '@camposcloud/sdk';

const api = new CamposCloudSDK({ 
    apiToken: "your-api-token-here" 
});
```

## Basic Usage

### Get User Information

```typescript
const main = async () => {
    try {
        const me = await api.getMe();
        console.log(`Hello ${me.name} 👋`);
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

main();
```

### Methods

#### `getMe()`
Get information about the authenticated user.

```typescript
const userInfo = await api.getMe();
```

**Returns:** `UserData` object containing user information.

#### `getApplication({ appId })`
Get details of a specific application.

```typescript
const app = await api.getApplication({ appId: "your-app-id" });
```

**Parameters:**
- `appId` (string): The ID of the application

**Returns:** `Application` instance

#### `getApplications()`
Get all applications for the authenticated user.

```typescript
const result = await api.getApplications();
console.log(result.applications);
console.log(`Total RAM used: ${result.totalUsedRAM}`);
```

**Returns:** Object containing:
- `applications`: Array of `ApplicationResponseData`
- `totalUsedRAM`: String indicating total RAM usage
- `pagination`: Pagination information

#### `createApplication(data)`
Create a new application.

```typescript
import fs from 'fs';

const file = await fs.promises.readFile('path/to/your/app.zip');

const app = await api.createApplication({
    appName: "My App",
    file: file,
    mainFile: "index.js",
    memoryMB: 512,
    runtimeEnvironment: "nodejs",
});
```

**Parameters:**
- `appName` (string): Name of the application
- `file` (Buffer): ZIP file containing your application
- `mainFile` (string): Entry point file (e.g., "index.js", "main.py")
- `memoryMB` (number): Memory allocation in MB
- `runtimeEnvironment` ("nodejs" | "python"): Runtime environment
- `exposedViaWeb` (boolean, optional): Whether to expose via web
- `autoRestartEnabled` (boolean, optional): Enable auto-restart
- `startupCommand` (string, optional): Custom startup command
- `teamId` (string, optional): Team ID if creating for a team

**Returns:** `Application` instance

#### `deleteApplication({ appId })`
Delete an application.

```typescript
await api.deleteApplication({ appId: "your-app-id" });
```

#### `startApplication({ appId })`
Start an application.

```typescript
const result = await api.startApplication({ appId: "your-app-id" });
```

#### `stopApplication({ appId })`
Stop an application.

```typescript
const result = await api.stopApplication({ appId: "your-app-id" });
```

#### `restartApplication({ appId })`
Restart an application.

```typescript
const result = await api.restartApplication({ appId: "your-app-id" });
```

#### `uploadFile({ appId, file, path })`
Upload a file to an application.

```typescript
import fs from 'fs';

const file = await fs.promises.readFile('path/to/file.txt');
const result = await api.uploadFile({ 
    appId: "your-app-id", 
    file: file,
    path: "/optional/path" 
});
```

**Parameters:**
- `appId` (string): The application ID
- `file` (Buffer): File content as Buffer
- `path` (string, optional): Target path in the application

## Application Class

When you get or create an application, you receive an `Application` instance with convenient methods:

```typescript
const app = await api.getApplication({ appId: "your-app-id" });

// Application data
console.log(app.data);

// Control methods
await app.start();
await app.stop();
await app.restart();
await app.delete();

// Upload file directly to this application
import fs from 'fs';
const file = await fs.promises.readFile('path/to/file.txt');
await app.uploadFile(file, '/optional/path');
```

### Application Methods

- `start()`: Start the application
- `stop()`: Stop the application
- `restart()`: Restart the application
- `delete()`: Delete the application
- `uploadFile(file: Buffer, path?: string)`: Upload a file to the application

## Complete Example

```typescript
import CamposCloudSDK from '@camposcloud/sdk';
import fs from 'fs';

const api = new CamposCloudSDK({ 
    apiToken: "your-api-token-here" 
});

const main = async () => {
    try {
        // Get user info
        const me = await api.getMe();
        console.log(`Hello ${me.name}!`);

        // Create an application
        const file = await fs.promises.readFile('my-app.zip');

        const app = await api.createApplication({
            appName: "My Node.js App",
            file: file,
            mainFile: "index.js",
            memoryMB: 256,
            runtimeEnvironment: "nodejs",
        });

        console.log(`Application created with ID: ${app.data._id}`);

        // Start the application
        await app.start();
        console.log('Application started!');

        // Upload additional file
        const configFile = await fs.promises.readFile('config.json');
        await app.uploadFile(configFile, '/config');
        console.log('Config file uploaded!');

        // Get all applications
        const apps = await api.getApplications();
        console.log(`You have ${apps.applications.length} applications`);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
```

## Error Handling

The SDK throws errors for various conditions. Always wrap your API calls in try-catch blocks:

```typescript
try {
    const app = await api.getApplication({ appId: "invalid-id" });
} catch (error: any) {
    if (error.response?.status === 404) {
        console.log('Application not found');
    } else {
        console.error('API Error:', error.message);
    }
}
```

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions. You'll get autocomplete and type checking out of the box:

```typescript
import { ApplicationResponseData, UserData } from '@camposcloud/sdk';

// Types are automatically inferred
const user: UserData = await api.getMe();
const apps: ApplicationResponseData[] = (await api.getApplications()).applications;
```

## Development

To contribute to this SDK:

```bash
# Clone the repository
git clone https://github.com/KevenCampos/camposcloud-sdk

# Install dependencies
npm install

# Run tests
npm run test

# Build the project
npm run build
```

## Support

- **Issues**: [GitHub Issues](https://github.com/KevenCampos/CamposCloudSDK/issues)
- **Email**: kevencampos1@hotmail.com

## License

This project is licensed under the ISC License.

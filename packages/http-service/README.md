# http-service

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`http-service` is a comprehensive package that provides essential services for web applications. This package includes `BaseHttpService` for making HTTP requests to servers and  `LoadingService` for managing loading indicators. Together, these services offer a robust solution for handling asynchronous operations and displaying loading feedback.

## Table of Contents

- [Installation](#installation)
- [BaseHttpService](#baseHttpService)
- [LoadingService](#loadingService)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add @resourge/http-service
```

or NPM:

```sh
npm install @resourge/http-service
```

# BaseHttpService

`BaseHttpService` is a main service for making requests to a server. It serves as a simple wrapper around the Fetch API, with added features such as request throttling for `GET` requests and support for file uploads.

## Usage

```JSX
import { BaseHttpService } from '@resourge/http-service'

const HttpService = new BaseHttpService({
  baseUrl: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token123'
  }
});

```

## Making Requests

`GET Request`

```typescript
HttpService.get('/posts/1')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

`POST Request`

```typescript
const postData = {
  title: 'New Post',
  body: 'Lorem ipsum...',
  userId: 1
};

HttpService.post('/posts', postData)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

`PUT Request`

```typescript
const updateData = {
  title: 'Updated Post',
  body: 'Updated content'
};

HttpService.put('/posts/1', updateData)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

`DELETE Request`

```typescript
HttpService.delete('/posts/1')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

`PATCH Request`

```typescript
const patchData = {
  body: 'Patched content'
};

HttpService.patch('/posts/1', patchData)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

`File Upload`

```typescript
const files = [file1, file2];
const formData = {
  description: 'File description'
};

HttpService.upload('POST', '/files', files, formData)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

### Custom Interceptors

Interceptors can be used to modify request or response configurations:

```typescript
HttpService.setToken(config => {
  // Modify request headers
  config.headers['Authorization'] = 'New Token';
  return config;
});

// Add a request interceptor
HttpService.interceptors.request.use(
  response => {
    // Modify response data or handle it
    return response;
  },
  error => {
    // Handle errors or modify error responses
    return Promise.reject(error);
  }
);

// Add a response interceptor
HttpService.interceptors.response.use(
  response => {
    // Modify response data or handle it
    return response;
  },
  error => {
    // Handle errors or modify error responses
    return Promise.reject(error);
  }
);
```

### Extending BaseHttpService

You can extend `BaseHttpService` to create a specialized service with additional methods or custom configurations:

```typescript
class CustomHttpService extends BaseHttpService {
  constructor() {
    super({
      baseUrl: 'https://api.example.com',
      headers: {
        'Authorization': 'Bearer token123'
      }
    });
  }

  // Add custom methods
  public customMethod() {
    // Custom logic here
  }
}

const CustomService = new CustomHttpService();
CustomService.customMethod();
```

# LoadingService

`LoadingService` is a simple service designed to manage the state of loading indicators in your application. It provides methods to show or hide loading indicators and allows components to listen for changes in loading state.

## Usage

```Typescript
import { LoadingService } from '@resourge/http-service';

// Show loading indicator
LoadingService.show();

// Show loading indicator with custom loaderId
LoadingService.show('myLoaderId');

// Hide loading indicator
LoadingService.hide();

// Hide loading indicator with custom loaderId
LoadingService.hide('myLoaderId');


// Add an event listener for the default loader
const removeListener = LoadingService.addListener(() => {
  // Handle loading state change
  console.log('Loading state changed!');
});

// Add an event listener for a specific loaderId
const removeCustomListener = LoadingService.addListener('myLoaderId', () => {
  // Handle loading state change for custom loaderId
  console.log('Custom Loading state changed!');
});

// To remove the listener later
removeListener(); // or removeCustomListener();
```

## API

`getLoading(loaderId?: string): boolean`

- Returns the current loading state for the specified loaderId. If no loaderId is provided, returns the default loading state.

`addListener(loaderId?: string, onEmit: () => void): () => void`
- Adds an event listener for the specified loaderId. When the loading state changes, the onEmit function will be called.
- Returns a function to remove the listener when no longer needed.

`show(loaderId?: string): void`
- Shows the loading indicator for the specified loaderId. If no loaderId is provided, shows the default loading indicator.

`hide(loaderId?: string): void`
- Hides the loading indicator for the specified loaderId. If no loaderId is provided, hides the default loading indicator.

## Documentation

For comprehensive documentation and usage examples, visit the [Http Service documentation](https://resourge.vercel.app/docs/fetch/http-service).

## Contributing

Contributions to `@resourge/http-service` are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

Fetch is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:
- GitHub: [Resourge](https://github.com/resourge)
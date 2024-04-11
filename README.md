# React Fetch

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Description

`react-fetch` is a lightweight and straightforward React package designed to simplify data fetching in React applications. It provides an intuitive way to make HTTP requests and manage the state of the data, loading, and errors within your components.

## Features

- Build with typescript.
- Build on top of fetch.
- useScrollRestoration to restore scroll position.
- useFetch tries to prevent "Can't perform a React state update on an unmounted component".
- Together with @resourge/http-service it will also abort request on component unmount. (@resourge/http-service is not mandatory but otherwise this functionality will need the developer to do it manually)
- Global, local components and LoadingService to centralize showing Loaders.
- Online, it will make sure to request only when is online.

## Documentation

For more documentation [react-fetch](./packages/react-fetch/README.md), or visit the [React Fetch documentation](https://resourge.vercel.app/docs/fetch/intro).


# Http Service

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Description

`http-service` is simple abstract class wrapping the Fetch api, adding throttle to get’s and the upload method. It also provides a LoadingService to provide events to a loader.

## Features

`BaseHttpService`
- `HTTP Requests`: Make various HTTP requests (GET, POST, PUT, DELETE, PATCH) to servers using the BaseHttpService, providing a simple wrapper around the Fetch API.

- `Throttling`: Throttle GET requests to prevent excessive server load with built-in request throttling.

- `Interceptors`: Customize request and response handling with interceptors, allowing for modifications before sending a request or after receiving a response.

- `File Uploads`: Support uploading files along with other form data with the upload method.

- `Customization`: Easily customize the behavior of BaseHttpService using class methods and configurations.

`LoadingService`
- `Show and Hide Loading Indicators`: Easily show or hide loading indicators with the LoadingService, providing visual feedback to users during asynchronous operations.

- `Event Listeners`: Components can register event listeners with the LoadingService, enabling dynamic updates to UI elements based on loading status changes.

- `Customizable`: Create multiple instances of LoadingService with different loaderIds for fine-grained control over loading indicators in different parts of your application.

## Documentation

For more documentation [http-service](./packages/http-service/README.md), or visit the [Http Service documentation](https://resourge.vercel.app/docs/fetch/http-service).

## Contributing

Contributions to Fetch and HttpService are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

Fetch and HttpService is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:
- GitHub: [Resourge](https://github.com/resourge)
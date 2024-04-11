#### This is a monorepo for the following packages:

- [react-fetch](./packages/react-fetch/README.md)
- [http-service](./packages/http-service/README.md)

# React Fetch

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Description

`react-fetch` provides a set of tools to simplify the request process. Provides useFetch, useScrollRestoration, FetchProvider, HttpService, LoadingService and a Loader and GlobalLoader.

## Features
- Build with typescript.
- Build on top of fetch.
- useScrollRestoration to restore scroll position.
- FetchProvider to inject configs like token, header, etc.
- useFetch tries to prevent “Can’t perform a React state update on an unmounted component”.
- Centralize request into a unique place, with HttpService.
- Together with @resourge/http-service it will also abort request on component unmount. (@resourge/http-service is not mandatory but otherwise this functionality will need the developer to do it)
- Global, local components and LoadingService to centralize showing Loaders.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

To install use npm:

```sh
npm install @resourge/react-fetch --save
```

or with Yarn:

```sh
yarn add @resourge/react-fetch
```

## Add support for React Native

Install the `react-native-url-polyfill` package:

```sh
npm install react-native-url-polyfill --save
```

or with Yarn:

```sh
yarn add react-native-url-polyfill
```

Add the following line to the entry file of your React Native app (usually `index.js`):

```javascript
// index.js
// Add
import 'react-native-url-polyfill/auto';
```

## Usage

```jsx
import React from 'react'

import {
  useFetch
} from '@resourge/react-fetch'

function FooComponent() {
  // const [products, fetch, isLoading, error] = useFetch(
  // or
  const { data: products, isLoading, error } = useFetch(
	() => {
      return // Axios/fetch/HttpService
	},
	{
	  initialValue: []
	}
  );

  if ( isLoading ) {
	return <>Loading...</>
  }

  if ( error ) {
	return <>Something went wrong</>
  }
  
  return (
    <ul>
	  {
		products.map((val) => (
		  <li key={val.id}>{ val.name }</li>
		))
	  }
    </ul>
  )
}

export default App
```

# Http Service

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Description

`http-service` is simple abstract class wrapping the Fetch api, adding throttle to get’s and the upload method. It also provides a LoadingService to provide events to a loader.


## Features
- Build with typescript.
- Build on top of fetch.
- Throttle get requests.
- Upload method.
- LoadingService to provide events to a loader.


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

To install use npm:

```sh
npm install @resourge/http-service --save
```

or with Yarn:

```sh
yarn add @resourge/http-service
```

## Usage

```jsx
import { BaseHttpService } from '@resourge/http-service'

class NewHttpService extends BaseHttpService {}

const HttpService = new NewHttpService();

const result = await HttpService.get('/getProducts');
const resultWithParams = await HttpService.get('/getProducts', { productId: 1 });
await HttpService.post('/postProducts', { productId: 1, productName: 'apple' });
await HttpService.put('/putProducts');
await HttpService.delete('/deleteProducts');
await HttpService.patch('/patchProducts');
await HttpService.upload('POST' | 'PUT', '/uploadProducts', files, data);

```

## LoadingService

Simple Service to show/hide a loading.

```jsx
import { LoadingService } from '@resourge/http-service';

LoadingService.show()
LoadingService.show('Loader Id') // To show specific loader's

LoadingService.hide()
LoadingService.hide('Loader Id') // To hide specific loader's

const removeEventListener = LoadingService.addEventListener(
  'Loader Id',
  (loading: boolean) => {
  
  }
)
```

For more detailed usage instructions, refer to the [documentation](#documentation).

## Documentation

For comprehensive documentation and usage examples, visit the [React Fetch documentation](https://resourge.vercel.app/docs/fetch/intro).
For comprehensive documentation and usage examples, visit the [Http Service documentation](https://resourge.vercel.app/docs/fetch/http-service).

## Contributing

Contributions to Fetch and HttpService are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

Fetch and HttpService is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:
- GitHub: [Resourge](https://github.com/resourge)
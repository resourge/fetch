# react-fetch

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`react-fetch` is a lightweight and straightforward React package designed to simplify data fetching in React applications. It provides an intuitive way to make HTTP requests and manage the state of the data, loading, and errors within your components.

## Table of Contents

- [Installation](#installation)
- [useFetch](#useFetch)
- [useScrollRestoration](#useScrollRestoration)
- [useFetchOnDependencyUpdate](#useFetchOnDependencyUpdate)
- [useIsOnline](#useIsOnline)
- [Loader Component](#loader)
- [GlobalLoader Component](#globalLoader)
- [LoadingFallback Component](#loadingFallback)
- [LoadingSuspense Component](#loadingSuspense)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add @resourge/react-fetch
```

or NPM:

```sh
npm install @resourge/react-fetch --save
```

## react-native

To use in react-native, it requires to use [react-native-url-polyfill](https://www.npmjs.com/package/react-native-url-polyfill)

```Typescript
// index.js
// Add
import 'react-native-url-polyfill/auto';
```

# useFetch

`useFetch` is a custom React hook designed to simplify data fetching and state management within functional React components. It handles loading states, errors, data updates, and request aborting. This hook is particularly useful when working with APIs or fetching data from external sources.

## Usage

To use useFetch, import it into your React component:

```JSX
import React from 'react'

import {
  useFetch
} from '@resourge/react-fetch'

const MyComponent = () => {
  const {
    data,
    error,
    fetch,
    isLoading,
    setFetchState
  } = useFetch(
    () => {
      return Http.get("url");
    },
    {
      initialState: []
    }
  );

  // Use data, error, fetch, isLoading, and setFetchState as needed

  return (
    <div>
      {/* Your JSX */}
    </div>
  );
};
```

### Parameters

useFetch accepts two parameters:

1. `method`: A function that performs the data fetching. It should return a Promise that resolves with the fetched data.
2. `config`: An optional configuration object with the following properties:
	- `enable` (boolean, default: true): When `false`, `useEffect` will not trigger fetch.
	- `loadingService` (string): Specifies a specific `LoadingService` instead of triggering the global one.
	- `deps` (readonly array): `useEffect` dependencies.
	- `id` (string): Assign a unique ID to the fetch request.
	- `initialState` (any): Default data values.
	- `onEffectEnd` (function): A function that executes only after `useEffect` completes.
	- `scrollRestoration` (function or array of functions): Functions to restore scroll position.
	- `silent` (boolean, default: false): When `false`, no loading will be triggered.

#### Examples

Fetch as `useState` and `useEffect`

```Javascript
const {
  data,
  error,
  fetch,
  isLoading,
  setFetchState
} = useFetch(
  () => {
    return Http.get("url");
  },
  {
    initialState: []
  }
);

```

Fetch as `useEffect`

```Javascript
const {
  error,
  fetch,
  isLoading
} = useFetch(
  () => {
    return Http.get("url");
  },
  {
    deps: []
  }
);
```

Only fetch

```Javascript
const {
  error,
  fetch,
  isLoading
} = useFetch(
  () => {
    return Http.get("url");
  }
);
```

### `Loading` Behavior

The `Loading` in `useFetch` can behave either globally or locally, depending on its usage within the useFetch hook.

- `Global Loading`: By default, `loading` will trigger a global loading state if not used within the component where useFetch is called. This means it will update a global loading indicator, potentially affecting other components listening for loading state changes.

- `Local Loading`: If `isLoading` is used within the component's rendering logic, `loading` will only trigger locally. This allows for more granular control over loading states within different parts of the application.

#### Examples

In the following example, isLoading is used within the component's rendering logic, causing it to trigger a local loading state:

```Javascript
const {
  data,
  error,
  fetch,
  isLoading,
  setFetchState
} = useFetch(
  () => {
    return Http.get("url");
  },
  {
    initialState: []
  }
);

return (
  <div>
    {isLoading ? (
      <p>Loading...</p>
    ) : (
      <p>Data: {data}</p>
    )}
  </div>
);
```

To trigger a global loading state, don't use isLoading from usFetch

```Javascript
const {
  data,
  error,
  fetch,
  setFetchState
} = useFetch(
  () => {
    return Http.get("url");
  },
  {
    initialState: [],
    // Optional, for triggering a specific loader other than the global
    // loadingService: 'specificLoadingService' // This will trigger a 
  }
);
```

# useScrollRestoration

`useScrollRestoration` is a custom React hook designed to restore scroll positions when navigating between pages or components. It helps maintain scroll positions and ensuring a seamless user experience.

## Usage

```javascript
import { useScrollRestoration } from '@resourge/react-fetch';

const MyComponent = () => {
  // 'action' must be 'pop' for restoration to work;
  const [scrollRestore, ref, onScroll] = useScrollRestoration('pop');

  // Use scrollRestore, ref, and onScroll as needed

  return (
    <div ref={ref} onScroll={onScroll}>
      {/* Your JSX */}
    </div>
  );
};
```

### Parameters

`useScrollRestoration` accepts two parameters:

1. `action`: A string specifying the action that triggers scroll restoration. Only `'pop'` will restore the scroll position.
1. `scrollRestorationId`: An optional unique ID categorizing the current component. It defaults to `window.location.pathname` if not provided.

### Example

```Javascript
import { useScrollRestoration } from '@resourge/react-fetch';
// or react-router
import { useAction } from '@resourge/react-router';

const MyComponent = () => {
  // 'action' must be 'pop' for restoration to work;
  const action = useAction();
  const [scrollRestoration, ref, onScroll] = useScrollRestoration(action);

  // Fetch data and trigger scroll restoration
  // 'scrollRestoration' is a function to restore scroll position
  const { data, fetch, error } = useFetch(
    () => {
      return HttpService.get("url");
    },
    {
      initialState: [],
      scrollRestoration // Pass scrollRestoration to useFetch for scroll restoration
    }
  );

  return (
	// onScroll is optional because ref will do, but for cases where ref can't listen to onScroll the function does the job
    <div ref={ref} onScroll={onScroll}>
      {/* Your JSX */}
    </div>
  );
};
```

In this example, `useScrollRestoration` is used to manage scroll restoration based on the action parameter (which should be `'pop'` for restoration to work) and a unique `scrollRestorationId`. It provides a `scrollRestoration` function to restore scroll position and can be used in conjunction with other hooks like `useFetch` for seamless scroll restoration during navigation.

_Note: If you choose not to use the `ref` returned by `useScrollRestoration`, the system will use the global `window` `onScroll` event to handle scroll restoration._


# useFetchOnDependencyUpdate

`useFetchOnDependencyUpdate` is a custom React hook designed to trigger all `useFetch` requests in mounted components when specified dependencies change. It helps remove the need to manually update dependencies for each `useFetch` call, providing a centralized way to manage fetch requests based on common dependencies.

## Usage

```javascript
import { useFetchOnDependencyUpdate } from '@resourge/react-fetch';

const MyComponent = ({ someDependency }) => {
  // Call useFetchOnDependencyUpdate with the dependency array
  useFetchOnDependencyUpdate([someDependency]);

  // Other component logic

  return (
    <div>
      {/* Your JSX */}
    </div>
  );
};
```

### Parameters

`useFetchOnDependencyUpdate` accepts two parameters:

1. `deps`: An array of dependencies that will trigger all `useFetch` requests in mounted components when they change.
1. `filterRequest`: An optional function to filter out requests not needed by the specified dependencies. The `id` parameter in the function is equal to the `id` used in the `useFetch` config.


### Example

```javascript
import { useFetchOnDependencyUpdate } from '@resourge/react-fetch';

const MyComponent = ({ userId }) => {
  // Trigger all useFetch requests when 'userId' changes
  useFetchOnDependencyUpdate([userId]);

  // Other component logic

  return (
    <div>
      {/* Your JSX */}
    </div>
  );
};
```

# useIsOnline

`useIsOnline` is a custom React hook designed to monitor the online status of the application. 

### Example

```javascript
import { useIsOnline } from 'path/to/useIsOnline';

const MyComponent = () => {
  const isOnline = useIsOnline();

  return (
    <div>
      <h1>Application Status</h1>
      <p>{isOnline ? 'Online' : 'Offline'}</p>
    </div>
  );
};

```

In this example, `useIsOnline` is used to monitor the online status of the application. The `isOnline` variable will be `true` when the application is online and `false` when offline. This can be useful for showing different UI components or handling network-related behavior accordingly.

# Loader

The `Loader` component is a React component designed to handle loading states within your application. It works in conjunction with `LoadingService` to provide a way for `useFetch` to display loading indicators based on there state.

## Props

`loaderId`
- Type: `string`
- Default: ''
- Description: Unique id to distinguish the Loader from other loaders. When not specified, it is treated as a global loader. 

`loadingElement` or `children`
- Type: `React.ReactNode`
- Default: `globalLoading`
- Description: The loading element to display when the `Loader` is in a loading state. This element will be shown instead of the `children` when `loading` is `true`. <br/>

## Usage

To use the `Loader` component, simply include it in your JSX with the desired `loaderId` and `loadingElement`:

```javascript
import React from 'react';
import { Loader } from '@resourge/react-fetch';

const MyComponent = () => {
  return (
    <div>
      <h1>My Component</h1>
	  {/* Omitting loaderId */}
      <Loader loaderId="myLoaderId">
        <p>This content will be displayed when loading</p>
      </Loader>
    </div>
  );
};
```

In this example, the `Loader` component is used with a specific `loaderId` ("myLoaderId") to trigger loading based on the state of `useFetch`'s with `loadingService` specified (in this case as "myLoaderId"). The default `loadingElement` will be displayed when the loader is in a loading state.

If you want to use the `Loader` component as the default loader (without a specific `loaderId`), simply omit the `loaderId` prop:

```javascript
import React from 'react';
import { Loader } from '@resourge/react-fetch';

const MyComponent = () => {
  return (
    <div>
      <h1>My Component</h1>
      <Loader>
        <p>This content will be displayed when loading</p>
      </Loader>
    </div>
  );
};
```

In this case, the `Loader` component will function as a global loader, meaning it will display the `loadingElement` or `children` for all `useFetch` without `loadingService`.

# GlobalLoader

The `GlobalLoader` component is a React component designed to display a global loading indicator on the entire page. It utilizes the `Loader` component and `createPortal` from React to render the loading element as an overlay on top of the page content.

## Props

`loaderId`
- Type: `string`
- Default: `''`
- Description: Unique id to distinguish the GlobalLoader from other loaders. - When not specified, it functions as a global loader covering the entire page.

`style`
- Type: `React.CSSProperties`
- Default: `{}`
- Description: Custom styles to apply to the global loading overlay.

`children`
- Type: `React.ReactNode`
- Default: `<GlobalLoading color={globalColor} />`
- Description: The content to display within the global loading overlay. If not - provided, a default loading indicator will be used.

`color`
- Type: `string`
- Default: `globalColor`
- Description: The color of the loading indicator. Default is `globalColor`.

## Usage

```javascript
import React from 'react';
import { GlobalLoader } from '@resourge/react-fetch';

const MyComponent = () => {
  return (
    <div>
      <h1>My Component</h1>
      <GlobalLoader loaderId="myGlobalLoaderId" />
      {/* Your content here */}
    </div>
  );
};
```

### Custom Loading Content

You can also provide custom loading content to the `GlobalLoader`:

```javascript
import React from 'react';
import { GlobalLoader } from '@resourge/react-fetch';
import CustomLoadingComponent from 'path/to/CustomLoadingComponent';

const MyComponent = () => {
  return (
    <div>
      <h1>My Component</h1>
      <GlobalLoader loaderId="myGlobalLoaderId">
        <CustomLoadingComponent />
      </GlobalLoader>
      {/* Your content here */}
    </div>
  );
};
```


# LoadingFallback

The `LoadingFallback` component is a React component designed to show a loading indicator on mount and hide it on unmount. It utilizes the `LoadingService` from the `@resourge/http-service` package to manage the loading state.

## Usage

```javascript
import React from 'react';
import { LoadingFallback } from '@resourge/react-fetch';

const MyComponent = () => {
  return (
    <div>
      <h1>My Component</h1>
      <LoadingFallback />
      {/* Your content here */}
    </div>
  );
};
```

In this example, the `LoadingFallback` component will display a loading indicator when the component mounts, and it will hide the loading indicator when the component unmounts.

# LoadingSuspense

The `LoadingSuspense` component is a React component designed to show a loading indicator when lazy-loaded components are being loaded. It utilizes React's `Suspense` component to handle the loading state and displays a `LoadingFallback` component as a fallback when the lazy components are loading.

## Usage

```javascript
import React from 'react';
import { LoadingSuspense } from '@resourge/react-fetch';

const MyLazyComponent = React.lazy(() => import('./MyLazyComponent'));

const MyComponent = () => {
  return (
    <div>
      <h1>My Component</h1>
      <LoadingSuspense>
        <MyLazyComponent />
      </LoadingSuspense>
      {/* Your content here */}
    </div>
  );
};
```

In this example, the `LoadingSuspense` component will display the `LoadingFallback` component while `MyLazyComponent` is being loaded lazily.

## Documentation

For comprehensive documentation and usage examples, visit the [React Fetch documentation](https://resourge.vercel.app/docs/fetch/intro).

## Contributing

Contributions to `@resourge/react-fetch` are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

Fetch is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:
- GitHub: [Resourge](https://github.com/resourge)
# react-fetch

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`react-fetch` is a lightweight and straightforward react package designed to simplify data fetching in react applications. It provides an intuitive way to make HTTP requests and manage the state of the data, loading, and errors within your components.

## Table of Contents

- [Installation](#installation)
- [useFetch](#usefetch)
- [usePagination](#usepagination)
- [useInfiniteLoading](#useinfiniteloading)
- [useScrollRestoration](#usescrollrestoration)
- [useInfiniteScrollRestoration](#useinfinitescrollrestoration)
- [useIsOnline](#useisonline)
- [Loader Component](#loader)
- [GlobalLoader Component](#globalloader)
- [LoadingFallback Component](#loadingfallback)
- [LoadingSuspense Component](#loadingsuspense)
- [RefreshControl Component](#refreshcontrol)
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

`useFetch` is a custom react hook designed to simplify data fetching and state management within functional react components. It handles loading states, errors, data updates, and request aborting. This hook is particularly useful when working with APIs or fetching data from external sources.

## Usage

To use useFetch, import it into your react component:

```JSX
import react from 'react'

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

`useFetch` accepts two parameters:

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

# usePagination

`usePagination` is a custom react hook designed to facilitate managing pagination in react applications. It manages pagination, filtering, sorting, and data fetching, providing a seamless experience for handling large datasets. It's built on top of `useFetch`, so all configurations and methods are the same.

## Usage

```JSX
import { usePagination } from '@resourge/react-fetch';

const MyComponent = () => {
  const {
    data,
    isLoading,
    error,
    fetch,
    changeItemsPerPage,
    changePage,
    resetPagination,
    pagination,
	sortTable
  } = usePagination(
    async (metadata) => {
      // Implement your logic to fetch data based on metadata
      const response = await Http.get("url");
      return { data: response.data, totalItems: response.totalItems };
    },
    {
      initialState: [],
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {/* Render data */}
      <ul>
        {data.map((item) => (
          <li key={item.id}>{/* Render item */}</li>
        ))}
      </ul>

      {/* Render loading indicator */}
      {isLoading && <p>Loading...</p>}

      {/* Render error message */}
      {error && <p>Error: {error.message}</p>}

      {/* Render pagination controls */}
      <div>
        <button onClick={() => changePage(0)}>First Page</button>
        <button onClick={() => changePage(pagination.totalPages - 1)}>Last Page</button>
        <button onClick={() => changeItemsPerPage(20)}>Show 20 Items/Page</button>
      </div>

      {/* Reset pagination */}
      <button onClick={() => resetPagination()}>Reset Pagination</button>
    </div>
  );
};

export default MyComponent;
```

### Parameters

`usePagination` accepts two parameters:

1. `method`: A function that performs the data fetching. It should return a Promise that resolves with the fetched data.
2. `config`: An configuration object with the following properties:
   - `...config` (object): Same [`useFetch` Parameters](#parameters).
   - `pagination` (object): Specifies the default pagination settings. This includes the initial page number and the number of items per page.
   - `filter` (object): Specifies the default filter settings. This can include properties like filter criteria or initial filter values.
   - `sort` (object): Specifies the default sorting settings. This can include properties like the initial sort order and column.

### Properties

- `filter`: Holds the current filter criteria used to query the data.
  ```typescript
  const filter: UserFilter = {
    name: "John",
    age: 30,
  };
  ```
- `setFilter`: A method to update the filter criteria
  ```typescript
  setFilter({
    page: 1,
    perPage: 10,
    sort: [{ orderBy: OrderByEnum.ASC, orderColumn: "name" }],
    customFilter: "example",
  });
  ```
- `sortTable`: Method to change the sorting of the table.

  ```typescript
  // Using full sorting criteria
  sortTable([{ orderBy: OrderByEnum.DESC, orderColumn: "date" }]);

  // Using individual column sorting parameters
  sortTable(OrderByEnum.ASC, "name");
  ```

- `sort`: Holds the current sorting criteria.
  ```typescript
  sort: [
    { orderBy: OrderByEnum.ASC, orderColumn: "name" },
    { orderBy: OrderByEnum.DESC, orderColumn: "date" },
  ];
  ```
- `changeItemsPerPage`: Method to change the number of items displayed per page.
  ```typescript
  changeItemsPerPage(20);
  ```
- `changePage`: Method to change the current page. Optionally accepts the total number of items.
  ```typescript
  changePage(2);
  ```
- `changePagination`: Method to change both the current page and the number of items per page.
  ```typescript
  changePagination(1, 50);
  ```
- `changeTotalPages`: Method to change the total number of pages based on the total number of items.
  ```typescript
  changeTotalPages(200);
  ```
- `data`: The fetched data.
- `error`: Error state from the fetch operation.
- `fetch`: Method to refetch the data.
  ```typescript
  fetch().then((data) => {
    console.log("Fetched data:", data);
  });
  ```
- `getPaginationHref`: Method to build an href for pagination navigation.
  ```typescript
  getPaginationHref(3);
  ```
- `isLoading`: Loading state of the fetch operation.
- `pagination`: Current pagination parameters including page, items per page, total items, and total pages.
- `reset`: Method to reset the pagination, sort, and/or filter to their initial or provided values.

  ```typescript
  reset();

  reset({ filter: { name: "John" } });
  ```

- `resetPagination`: Method to reset the pagination to initial/default values.
  ```typescript
  resetPagination();
  ```
- `setPaginationState`: Method to manually set the fetch state.
  ```typescript
  setPaginationState([]);
  ```

# useInfiniteLoading

`useInfiniteLoading` is a custom react hook designed to facilitate infinite loading in react applications. It manages pagination, filtering, sorting, and data fetching, providing a seamless experience for handling large datasets. It's built on top of `useFetch`, so all configurations and methods are the same.

## Usage

```JSX
import { useInfiniteLoading } from '@resourge/react-fetch';

const MyComponent = () => {
  const { data, isLoading, error, loadMore, changeItemsPerPage } = useInfiniteLoading(
    async (metadata) => {
      // Implement your logic to fetch data based on metadata
      const response = await Http.get("url");
      return { data: response.data, totalItems: response.totalItems };
    },
    {
      initialState: [],
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={loadMore}>Load More</button>
      <button onClick={() => changeItemsPerPage(20)}>Change Items Per Page</button>
    </div>
  );
};

export default MyComponent;
```

### Parameters

`useInfiniteLoading` accepts two parameters:

1. `method`: A function that performs the data fetching. It should return a Promise that resolves with the fetched data.
2. `config`: An configuration object with the following properties:
   - `...config` (object): Same [`useFetch` Parameters](#parameters).
   - `pagination` (object): Specifies the default pagination settings. This includes the initial page number and the number of items per page.
   - `filter` (object): Specifies the default filter settings. This can include properties like filter criteria or initial filter values.
   - `sort` (object): Specifies the default sorting settings. This can include properties like the initial sort order and column.

### Properties

[Properties](#properties)

# useScrollRestoration

`useScrollRestoration` is a custom react hook designed to restore scroll positions when navigating between pages or components. It helps maintain scroll positions and ensuring a seamless user experience.

## Usage

```javascript
import { useScrollRestoration } from "@resourge/react-fetch";

const MyComponent = () => {
  // 'action' must be 'pop' for restoration to work;
  const [scrollRestore, ref, onScroll] = useScrollRestoration("pop");

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
import { useScrollRestoration, useFetch } from '@resourge/react-fetch';
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

# useInfiniteScrollRestoration

`useInfiniteScrollRestoration` is a custom react hook designed for restoring scroll positions in infinite scroll components within a react application. It enables seamless restoration of scroll positions when navigating back and forth between pages or components, enhancing the user experience.

## Usage

```javascript
import { useInfiniteScrollRestoration } from "@resourge/react-fetch";

const MyComponent = () => {
  // 'action' must be 'pop' for restoration to work;
  const [scrollRestore, ref, onScroll] = useInfiniteScrollRestoration("pop");

  // Use scrollRestore, ref, and onScroll as needed

  return (
    <div ref={ref} onScroll={onScroll}>
      {/* Your JSX */}
    </div>
  );
};
```

### Parameters

`useInfiniteScrollRestoration` accepts two parameters:

1. `action`: A string specifying the action that triggers scroll restoration. Only `'pop'` will restore the scroll position.
1. `scrollRestorationId`: An optional unique ID categorizing the current component. It defaults to `window.location.pathname` if not provided.

### Example

```Javascript
import { useInfiniteScrollRestoration, useInfiniteLoading } from '@resourge/react-fetch';
// or react-router
import { useAction } from '@resourge/react-router';

const MyComponent = () => {
  // 'action' must be 'pop' for restoration to work;
  const action = useAction();
  const [scrollRestoration, ref, onScroll] = useInfiniteScrollRestoration(action);

  // Fetch data and trigger scroll restoration
  // 'scrollRestoration' is a function to restore scroll position
  const { data, fetch, error } = useInfiniteLoading(
    async (metadata) => {
      // Implement your logic to fetch data based on metadata
      const response = await Http.get("url");
      return { data: response.data, totalItems: response.totalItems };
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

In this example, `useInfiniteScrollRestoration` is used to manage scroll restoration based on the action parameter (which should be `'pop'` for restoration to work) and a unique `scrollRestorationId`. It provides a `scrollRestoration` function to restore scroll position and can be used in conjunction with other hooks like `useInfiniteLoading` for seamless scroll restoration during navigation.

_Note: If you choose not to use the `ref` returned by `useScrollRestoration`, the system will use the global `window` `onScroll` event to handle scroll restoration._

# useIsOnline

`useIsOnline` is a custom react hook designed to monitor the online status of the application.

### Example

```javascript
import { useIsOnline } from "path/to/useIsOnline";

const MyComponent = () => {
  const isOnline = useIsOnline();

  return (
    <div>
      <h1>Application Status</h1>
      <p>{isOnline ? "Online" : "Offline"}</p>
    </div>
  );
};
```

In this example, `useIsOnline` is used to monitor the online status of the application. The `isOnline` variable will be `true` when the application is online and `false` when offline. This can be useful for showing different UI components or handling network-related behavior accordingly.

# Loader

The `Loader` component is a react component designed to handle loading states within your application. It works in conjunction with `LoadingService` to provide a way for `useFetch` to display loading indicators based on there state.

## Props

`loaderId`

- Type: `string`
- Default: ''
- Description: Unique id to distinguish the Loader from other loaders. When not specified, it is treated as a global loader.

`loadingElement` or `children`

- Type: `react.ReactNode`
- Default: `globalLoading`
- Description: The loading element to display when the `Loader` is in a loading state. This element will be shown instead of the `children` when `loading` is `true`. <br/>

## Usage

To use the `Loader` component, simply include it in your JSX with the desired `loaderId` and `loadingElement`:

```javascript
import react from "react";
import { Loader } from "@resourge/react-fetch";

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
import react from "react";
import { Loader } from "@resourge/react-fetch";

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

The `GlobalLoader` component is a react component designed to display a global loading indicator on the entire page. It utilizes the `Loader` component and `createPortal` from react to render the loading element as an overlay on top of the page content.

## Props

`loaderId`

- Type: `string`
- Default: `''`
- Description: Unique id to distinguish the GlobalLoader from other loaders. - When not specified, it functions as a global loader covering the entire page.

`style`

- Type: `react.CSSProperties`
- Default: `{}`
- Description: Custom styles to apply to the global loading overlay.

`children`

- Type: `react.ReactNode`
- Default: `<GlobalLoading color={globalColor} />`
- Description: The content to display within the global loading overlay. If not - provided, a default loading indicator will be used.

`color`

- Type: `string`
- Default: `globalColor`
- Description: The color of the loading indicator. Default is `globalColor`.

## Usage

```javascript
import react from "react";
import { GlobalLoader } from "@resourge/react-fetch";

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
import react from "react";
import { GlobalLoader } from "@resourge/react-fetch";
import CustomLoadingComponent from "path/to/CustomLoadingComponent";

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

The `LoadingFallback` component is a react component designed to show a loading indicator on mount and hide it on unmount. It utilizes the `LoadingService` from the `@resourge/http-service` package to manage the loading state.

## Usage

```javascript
import react from "react";
import { LoadingFallback } from "@resourge/react-fetch";

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

The `LoadingSuspense` component is a react component designed to show a loading indicator when lazy-loaded components are being loaded. It utilizes react's `Suspense` component to handle the loading state and displays a `LoadingFallback` component as a fallback when the lazy components are loading.

## Usage

```javascript
import react from "react";
import { LoadingSuspense } from "@resourge/react-fetch";

const MyLazyComponent = react.lazy(() => import("./MyLazyComponent"));

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

# RefreshControl

`RefreshControl` is a react component designed to facilitate the implementation of infinite scrolling behavior with refresh controls in react applications. It provides a convenient way to manage scroll detection and trigger data loading for infinite scroll components. _Note: Browse only, use FlatList for react-native_

## Usage

```tsx
import { RefreshControl } from "@resourge/react-fetch";

const MyComponent = ({ context }: { context: InfiniteLoadingReturn }) => {
  return (
    <RefreshControl
      context={context}
      detectionMargin="100%" // Optional: Set detection margin
      renderComponent={({ canLoadMore, onClick }) => (
        // Render your custom refresh control component here
        <div>
          <button onClick={onClick} disabled={!canLoadMore}>
            Load More
          </button>
        </div>
      )}
    />
  );
};

export default MyComponent;
```

## Props

`context`

- Type: `object`
- Description: Containing the context data provided by the `useInfiniteLoading` hook.

`renderComponent`

- Type: `function`
- Description: Renders the custom refresh control component. It receives props indicating whether the last page is incomplete and a function to trigger loading more data.

`detectionMargin`

- Type: `function`
- Description: By default, it is set to '100%'. Specifies the detection margin for intersection observer. Can be adjusted to fine-tune scroll detection behavior.

## Documentation

For comprehensive documentation and usage examples, visit the [react Fetch documentation](https://resourge.vercel.app/docs/fetch/intro).

## Contributing

Contributions to `@resourge/react-fetch` are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

Fetch is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:

- GitHub: [Resourge](https://github.com/resourge)

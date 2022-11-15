# react-fetch

`react-fetch` provides a set of tools to simplify the request process. <br />
Provides useFetch, useFetchCallback, useScrollRestoration, FetchProvider, HttpService, LoadingService and a Loader and GlobalLoader.

## Features

- Build with typescript.
- Build on top of fetch.
- useScrollRestoration to restore scroll position.
- FetchProvider to inject configs like token, header, etc.
- useFetch tries to prevent "Can't perform a React state update on an unmounted component".
- Centralize request into a unique place, with HttpService.
- Global, local components and LoadingService to centralize showing Loaders.

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add @resourge/react-fetch
```

or NPM:

```sh
npm install @resourge/react-fetch --save
```

## Usage

```JSX
import React from 'react'

import {
  FetchProvider,
  useFetch,
  HttpService
} from '@resourge/react-fetch'

function FooComponent() {
  // const [products, fetch, isLoading, error] = useFetch(
  // or
  const { data: products, isLoading, error } = useFetch(
	() => {
	  return HttpService.get('/productList')
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


function App() {
  const token = '';
  return (
    ...
	// Not required but necessary to inject token
	<FetchProvider
	  // Exists by default a global HttpService 
	  // But in case the developer needs a different HttpService
	  // httpService={httpServiceClass}
	  config={{
		// Exists Global Config and Local
		// Basically sets the default action it should take
		// Local config will always override global
	  }}
	  onRequest={(config) => {
		// To Inject token or other headers
		config.headers = {
		  ...config.headers,
		  Authorization: `Bearer ${token}`
		}
		return config;
	  }}
	>
	  <FooComponent />
	</FetchProvider>
	...
  )
}

export default App
```

## useFetch

Hook to fetch and set data.
It will do the loading, error, set data, manually abort request if component is unmounted, and/or triggering other useFetch/useFetchCallback's

```JSX
// const { data: products, isLoading, error } = useFetch(
// or
const [data, fetch, error, isLoading] = useFetch(
  () => {
    return HttpService.get("url")
  }, 
  {
    initialState: []
  }
);
```

### Options

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| **initialState** | `any` | true | Default data values. |
| **deps** | `React.DependencyList` | false | useEffect dependencies. Basically works on useEffect dependencies |
| **noEmitError** | `boolean` | false | When false makes it so no error is emitted.  |
| **onWindowFocus** | `boolean` | false | Fetch on window focus (default: true) |
| **scrollRestoration** | `method or array of method` | false | Serves to restore scroll position. [see how its done](#scrollRestoration) |
| **silent** | `boolean` | false | Doesn't trigger any Loading. (default: false) |
| **useLoadingService** | `boolean, string or string[]` | false | Instead of triggering a local loading, this make it so LoadingService does it. [see more](#useLoadingService) |
| **fetchId** | `string` | false | Serves as an uniqueId to be able to trigger in other fetch calls |
| **trigger** | `object` | false | To trigger other useFetchCallback/useFetch. <br /> _Note: In the case of useFetchCallback having params, its necessary to set trigger after/before with name and params instead of a string_ [see more](#trigger) |
| **abort** | `boolean` | false | To abort on component unmount. |

#### scrollRestoration

```JSX
import React from 'react'

import {
  useScrollRestoration,
  useFetch,
  HttpService
} from '@resourge/react-fetch'

function App() {
  const [scrollRestoration, ref] = useScrollRestoration('unique id to this component');
  // If ref is not set it will update window scrollbar
  const { data: products, isLoading, error } = useFetch(
	() => {
	  return HttpService.get('/productList')
	},
	{
	  initialValue: [],
	  scrollRestoration: scrollRestoration
	}
  );

  if ( isLoading ) {
	return <>Loading...</>
  }

  if ( error ) {
	return <>Something went wrong</>
  }
  
  return (
    <ul ref={ref}>
	  {
		products.map((val) => (
		  <li key={val.id}>{ val.name }</li>
		))
	  }
    </ul>
  )
}
```

#### useLoadingService

Instead of triggering a local loading, this make it so LoadingService does it.
It can be a boolean, string or array of strings. <br />
When:
*  true - Will trigger GlobalLoading loading;
*  string - Will trigger loaderId Loading ("``` <Loader loaderId="">```") 
*  string[] - Will trigger all loaderId Loading ("``` <Loader loaderId="">```") 

## useFetchCallBack

Hook to fetch and control loading.
It will manually abort request if component is unmounted, and/or triggering other useFetch/useFetchCallback's.
_Note: It will not trigger on useEffect, for that use `useFetch`._

```JSX
// const { data: products, isLoading, error } = useFetch(
// or
const fetchMethod = useFetchCallBack(() => {
  return HttpService.get("url")
});
```

### Options

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| **initialState** | `boolean` | false | Default data values. |
| **noEmitError** | `boolean` | false | When false makes it so no error is emitted.  |
| **silent** | `boolean` | false | Doesn't trigger any Loading. (default: false) |
| **useLoadingService** | `boolean, string or string[]` | false | Instead of triggering a local loading, this make it so LoadingService does it. [see more](#useLoadingService) |
| **fetchId** | `string` | false | Serves as an uniqueId to be able to trigger in other fetch calls |
| **trigger** | `object` | false | To trigger other useFetchCallback/useFetch.  <br />_Note: In the case of useFetchCallback having params, its necessary to set trigger after/before with name and params instead of a string_ [see more](#trigger) |
| **abort** | `boolean` | false | To abort on component unmount. |

## FetchProvider

Component to provide a way to inject headers, token or config.

```JSX
import React from 'react'

import {
  FetchProvider
} from '@resourge/react-fetch'

function App() {
  const token = '';
  return (
	// Not required but necessary to inject token
	<FetchProvider
	  // Exists by default a global HttpService 
	  // But in case the developer needs a different HttpService
	  // httpService={httpServiceClass}
	  config={{
		// Exists Global Config and Local
		// Basically sets the default action it should take
		// Local config will always override global
	  }}
	  onRequest={(config) => {
		// To Inject token or other headers
		config.headers = {
		  ...config.headers,
		  Authorization: `Bearer ${token}`
		}
		return config;
	  }}
	>
	  ...
	</FetchProvider>
  )
}

export default App
```

## Loader

Component show loading at the useFetch or LoadingService command. <br />
`loadingElement` is optional. When undefined it will use either the GlobalLoader loading component or the default. 

```JSX
import React from 'react'

import {
  Loader
} from '@resourge/react-fetch'

function Bar() {
  const [data, fetch, error, isLoading] = useFetch(
    () => {
      return HttpService.get("/getBar")
    }, 
    {
      initialState: [],
	  useLoadingService: "Loading one" // Will trigger Loader loaderId="Loading one"
    }
  );

  return (
	...
  )
}

function App() {
  return (
	<Loader
	  // Mandatory and it's the id of this loader
	  loaderId="Loading one"
	  // Optional, in case it is undefined it will use GlobalLoader component.
	  loadingElement={<div>Loading Message</div>}
	>
	  children
	</FetchProvider>
  )
}

export default App
```

### GlobalLoader

Component with loaderId to trigger loading at the useFetch or LoadingService command.
Serves as the global type, where it shows the loading on the entire page.
By default loaderId is ''. <br />
_Note: Make sure the component is the last one in App/index and it is not inside any style that can influence a absolute position._

```JSX
import React from 'react'

import {
  GlobalLoader
} from '@resourge/react-fetch'

function Foo() {
  const [data, fetch, error, isLoading] = useFetch(
    () => {
      return HttpService.get("/getFoo")
    }, 
    {
      initialState: [],
	  useLoadingService: true // Will trigger GlobalLoader
    }
  );

  return (
	...
  )
}


function App() {
  return (
	<div>
	  ...// Other Components
	  <Foo />
	  <GlobalLoader
	    // Optional, in case it is undefined it will use GlobalLoader component.
	    loadingElement={<div>Loading Message</div>}
	  />
	</div>
  )
}

export default App
```

## Trigger

`Trigger` is the ability to trigger other useFetch/useFetchCallback after or before current useFetch/useFetchCallback.
In the case of useFetchCallback having params, its necessary to set trigger after/before with name and params instead of a string.

| Name | Type | Description |
| ---- | ---- | ----------- |
| **after** | `Array<string | { loaderId: string, params: any[] }>` | Triggers useFetch/useFetchCallback(by triggerId) after current fetch is done. |
| **before** | `Array<string | { loaderId: string, params: any[] }>` | Triggers useFetch/useFetchCallback(by triggerId) before current fetch is done. |

```JSX
function Foo() {
  const [data, fetch, error, isLoading] = useFetch(
    () => {
      return HttpService.get("/getFoo")
    }, 
    {
      initialState: [],
	  triggerId: 'Fetch from Foo'
    }
  );

  const getSecondMethod = useFetchCallback(
	(dataSourceId) => {
      return HttpService.get("/getSecondMethod", { dataSourceId })
	}, 
    {
	  triggerId: 'Second Fetch from Foo'
    }
  )

  return (
	...
  )
}

function Bar({ dataSourceId }) {
  const [data, fetch, error, isLoading] = useFetch(
    () => {
      return HttpService.get("/getBar")
    }, 
    {
      initialState: [],
	  trigger: {
		// After this request is done it will trigger Foo component fetch. (Note: each time this fetch is done.)
		after: ['Fetch from Foo'],
		// Before this request is done it will trigger Foo component fetch. (Note: each time this fetch is done.)
		before: [
			// When the trigger method has params, its mandatory to be an object otherwise a string is enough
			{
				loaderId: 'Second Fetch from Foo',
				params: [dataSourceId]
			}
		]
	  }
    }
  );

  return (
	...
  )
}
```

## HttpService

Main service to make the requests to the server.
_Note: All request need to pass throw this to useFetch/useFetchCallback to work as intended._

### HttpServiceClass

In a specific project requires that request are done in a certain way (ex: all request are posts(it happens)), HttpServiceClass serves as a way for the developer to extend all request.

```jsx
import { HttpServiceClass } from '@resourge/react-fetch'
// In case HttpServiceClass is augmented, it's necessary to also declare it
// like the following for it to work with autocomplete and types
declare module '@resourge/react-fetch' {
  interface HttpServiceClass {
    fileBlob: (url: string) => Promise<{ file: Blob, fileName: string }>
  }
}

import { HttpServiceClass, setDefaultHttpService } from '@resourge/react-fetch';

class YourHttpServiceClass extends HttpServiceClass {
  public async get<T = any, R = ResponseConfig<T>>(url: string): Promise<R>;
  public async get<T = any, R = ResponseConfig<T>>(url: string, params: undefined, config: GetMethodConfig): Promise<R>;
  public async get<T = any, R = ResponseConfig<T>, K extends object | any[] = any>(url: string, params: K): Promise<R>;
  public async get<T = any, R = ResponseConfig<T>, K extends object | any[] = any>(url: string, params: K, config: GetMethodConfig): Promise<R>;
  public async get<T = any, R = ResponseConfig<T>, K extends object | any[] = any>(url: string, params?: K, config?: GetMethodConfig): Promise<R> {
    return super.get(url, params, { ...config, method: 'post' })
  }

  public fileBlob(url: string): Promise<{ file: Blob, fileName: string }> {
    return this.get(
      url,
      undefined,
      {
        async transform(response, request) {
          const fileName = request.headers ? (request.headers      ['x-content-filename'] ??   '')   : '';
          
          const div = document.createElement('div');
          
          div.innerHTML = fileName;
          
          return {
            file: await response.blob(),
            fileName: div.textContent
          }
        }
      }
    )
  }
}

import {
  FetchProvider
} from '@resourge/react-fetch'

function App() {
  return (
	// Not required but necessary to inject token
	<FetchProvider
	  // This will override default HttpService
	  httpService={YourHttpServiceClass}
	  ...
	>
	  ...
	</FetchProvider>
  )
}
```

## LoadingService

Simple global service to show/hide a ```<Loader />```.

```Typescript
import { LoadingService } from '@resourge/react-fetch';

LoadingService.show() // Will trigger GlobalLoader
LoadingService.show('Loader Id') // To show specific ```<Loader />```

LoadingService.hide()
LoadingService.hide('Loader Id') // To hide specific ```<Loader />```

const removeEventListener = LoadingService.addEventListener(
  'Loader Id',
  (loading: boolean) => {
  
  }
)
```

## License

MIT Licensed.
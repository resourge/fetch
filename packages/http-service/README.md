# http-service

`http-service` is simple wrapper on Fetch api, adding throttle to get's and the upload method. It also provides a LoadingService to provide events to a loader.

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add @resourge/http-service
```

or NPM:

```sh
npm install @resourge/http-service
```

## Usage

```JSX
import { HttpService } from '@resourge/http-service'

const result = await HttpService.get('/getProducts');
const resultWithParams = await HttpService.get('/getProducts', { productId: 1 });
await HttpService.post('/postProducts', { productId: 1, productName: 'apple' });
await HttpService.put('/putProducts');
await HttpService.delete('/deleteProducts');
await HttpService.patch('/patchProducts');
await HttpService.upload('POST' | 'PUT', '/uploadProducts', files, data);

```

## HttpService

Main service to make the requests to the server.
_Note: All request need to pass throw this to useFetch/useFetchCallback to work as intended._

### HttpServiceClass

In a specific project requires that request are done in a certain way (ex: all request are posts(it happens)), HttpServiceClass serves as a way for the developer to extend all request.

```Typescript
// In a *.d.ts (for example: react-app-env.d.ts)
import { HttpServiceV2 } from '....'

declare module '@resourge/react-fetch' {
	export const HttpService: HttpServiceV2
}
```

```Typescript
// 
import { HttpServiceClass, setDefaultHttpService } from '@resourge/http-service';

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

// Method to change global/default HttpService
setDefaultHttpService(new YourHttpServiceClass())
```

```Typescript
// In a *.d.ts (for example: react-app-env.d.ts)
import { YourHttpServiceClass } from '....'

declare module '@resourge/react-fetch' {
	export const HttpService: YourHttpServiceClass
}
```

## LoadingService

Simple Service to show/hide a loading.

```Typescript
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

## License

MIT Licensed.
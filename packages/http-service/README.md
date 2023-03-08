# http-service

`http-service` is simple abstract class wrapping the Fetch api, adding throttle to get's and the upload method. It also provides a LoadingService to provide events to a loader.

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
import { useEffect } from 'react'

import { useFetch } from 'packages/react-fetch/src/hooks/useFetch'

const ProductsApi = {
	useGetProductsApi() {
		return useFetch(
			(Http) => {
				console.log('a')
				return Http.get('https://dummyjson.com/products/1')
			},
			{
				initialState: undefined,
				deps: [],
				useLoadingService: true
			}
		);
	}
}

function App() {
	const a = ProductsApi.useGetProductsApi();
	const [data, GetProductsApi, error, isLoading] = a
	console.log('[data, fetch, error, isLoading]', [data, GetProductsApi, error, isLoading])
	const b = useFetch(
		(Http) => {
			return Http.get('https://dummyjson.com/products/1')
		},
		{
			initialState: undefined,
			deps: [],
			useLoadingService: true
		}
	)
	const c = useFetch(
		(Http) => {
			return Http.get('https://dummyjson.com/products/1')
		},
		{
			useLoadingService: true
		}
	)

	useEffect(() => {
		
	}, [])

	return (
		<div className="App">
			App
		</div>
	)
}

export default App

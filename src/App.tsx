import { useState } from 'react';

import { BaseHttpService } from 'packages/http-service/src'
import { useFetch } from 'packages/react-fetch/src'

const sleep = (delay: number) => new Promise((resolve) => 
	setTimeout(resolve, delay)

)

const HttpService = new BaseHttpService();

HttpService.interceptors.request.use(
	async (config) => {
		const delay = Math.random() * 1000;
		console.log('config', config.url.href, delay)
		await sleep(delay);
		return config
	}
)

const A: React.FC = ({ }) => {
	const [c, setC] = useState(0)
	const [D, setD] = useState(0)
	console.log('render A')

	const { fetch } = useFetch(
		async function (a) {
			await HttpService.get('/d')
			setD(Math.random())
		}
	)

	useFetch(
		async () => {
			await HttpService.get('/c')

			await fetch(10);

			return Math.random();
		},
		{
			initialState: undefined,
			deps: [],
			onDataChange(a) {
				console.log('onDataChange c', a)
				setC(Math.random())
			}
		}
	)

	return (
		<></>
	);
};

function App() {
	const [a, setA] = useState(0)
	const [b, setB] = useState(0)
	console.log('render App')

	useFetch(
		async () => {
			await HttpService.get('/a')

			setA(Math.random())
		},
		{
			initialState: undefined,
			deps: []
		}
	)

	useFetch(
		async () => {
			await HttpService.get('/b')

			return Math.random();
		},
		{
			initialState: undefined,
			deps: [],
			onDataChange(a) {
				console.log('onDataChange b', a)
				setB(Math.random())
			}
		}
	)

	return (
		<div>
			App
			<A />
		</div>
	)
}

export default App

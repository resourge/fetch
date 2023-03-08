import { BaseHttpService } from 'packages/http-service/src'
import { useFetch } from 'packages/react-fetch/src'

const HttpService = new (class extends BaseHttpService { })()

function Custom() {
	useFetch(
		async () => {
			console.log('-->Custom test1')
			const data = await HttpService.get('Custom test1')
			return data.data.map(() => '{}')
		},
		{
			deps: []
		}
	)

	useFetch(
		async () => {
			console.log('-->Custom test2')
			const data = await HttpService.get('Custom test2')
			return data.data.map(() => '{}')
		},
		{
			deps: []
		}
	)

	return (
		<div>
			App
		</div>
	)
}

// eslint-disable-next-line react/no-multi-comp
function App() {
	const [getTestqweqw] = useFetch(
		async () => {
			console.log('-->Method test1')
			const data = await HttpService.get('Method test1')
			return data.data.map(() => '{}')
		}
	)

	useFetch(
		async () => {
			console.log('-->test1')
			const data = await HttpService.get('test1').catch(() => ({
				data: [] 
			}))
			await getTestqweqw();
			return data.data.map(() => '{}')
		},
		{
			deps: []
		}
	)

	useFetch(
		async () => {
			console.log('-->test2')
			const data = await HttpService.get('test2')
			return data.data.map(() => '{}')
		},
		{
			deps: []
		}
	)

	return (
		<div>
			App
			<Custom />
		</div>
	)
}

export default App

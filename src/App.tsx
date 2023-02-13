import { throttlePromise } from 'packages/http-service/src/utils/throttlePromise'

function App() {
	console.log('throttlePromise', throttlePromise)
	return (
		<div className="App">
			App
		</div>
	)
}

export default App

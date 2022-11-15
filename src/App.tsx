import { HttpService } from 'packages/http-service/src';
HttpService.defaultConfig.threshold = 0;
HttpService.upload('POST', 'https://dummyjson.com/products/1', [], {
	test: 12 
}).then(() => {
	console.log('then1')
})
function App() {
	return (
		<div className="App">
			App
		</div>
	)
}

export default App

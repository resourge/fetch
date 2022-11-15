import { HttpService } from 'packages/http-service/src';
HttpService.get('https://dummyjson.com/products/1', {
	include: 'author'
}, {
	mode: 'cors' 
}).then(() => {
	console.log('then1')
})
.catch(() => {
	console.log('catch1')
})
HttpService.get('https://dummyjson.com/products/1', {
	include: 'author'
}).then(() => {
	console.log('then2')
})
.catch(() => {
	console.log('catch2')
})
HttpService.get('https://dummyjson.com/products/1', {
	include: 'author'
}).then(() => {
	console.log('then3')
})
.catch(() => {
	console.log('catch3')
})
HttpService.get('https://dummyjson.com/products/1', {
	include: 'author'
}).then(() => {
	console.log('then4')
})
.catch(() => {
	console.log('catch4')
})

setTimeout(() => {
	HttpService.get('https://dummyjson.com/products/1', {
		include: 'author'
	}).then(() => {
		console.log('then5')
	})
	.catch(() => {
		console.log('catch5')
	})
}, 999);
function App() {
	return (
		<div className="App">
			App
		</div>
	)
}

export default App

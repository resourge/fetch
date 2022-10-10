import fs from 'fs';
import mergeDirs from 'merge-dirs'
import path from 'path';

async function getFiles(dir: string): Promise<string[]> {
	const dirFiles = await fs.promises.readdir(dir, {
		withFileTypes: true 
	});
	const files = await Promise.all(dirFiles.map((dirent) => {
		const res = path.resolve(dir, dirent.name);
		return dirent.isDirectory() ? getFiles(res) : res;
	}));
	return Array.prototype.concat(...files);
}

(async () => {
	let results: string[] = await Promise.all([
		fs.promises.readFile('packages/react-fetch/dist/http-service/src/index.d.ts', 'utf-8'),
		fs.promises.readFile('packages/react-fetch/dist/react-fetch/src/index.d.ts', 'utf-8')
	]);

	results = results
	.map((res) => res.split('\n'))
	.flat()
	.filter((res, index, arr) => {
		if ( !res || res.includes('http-service') ) {
			return false;
		}
		return arr.findIndex((arrRes) => res === arrRes) === index
	})

	// Write the joined results to destination
	await fs.promises.writeFile('packages/react-fetch/dist/react-fetch/src/index.d.ts', results.join('\n'));
	
	mergeDirs.default('packages/react-fetch/dist/http-service/src', 'packages/react-fetch/dist/react-fetch/src');
	
	mergeDirs.default('packages/react-fetch/dist/react-fetch/src', 'packages/react-fetch/dist', 'overwrite');
	
	fs.rmSync('packages/react-fetch/dist/react-fetch', {
		recursive: true,
		force: true 
	});
	fs.rmSync('packages/react-fetch/dist/http-service', {
		recursive: true,
		force: true 
	});

	const dir = 'packages/react-fetch/dist';

	const declarationFiles = await getFiles(dir);

	await Promise.all(
		declarationFiles.map(async (_fileName) => {
			let code = await fs.promises.readFile(_fileName, 'utf-8');

			const mat = code.match(/'packages\/.*';/g) ?? [];
			const fileName = path.resolve(dir, _fileName)

			mat.forEach((val) => {
				const a = val.replace("';", '').replace("'", '')
				.replace("'", '')
				.split('src/')[1];
				const p = path.resolve(dir, a);

				const relArray = path.relative(fileName, p).split('/');

				relArray.shift();

				code = code.replace(val, `'${relArray.join('/')}';`)
			})

			return await fs.promises.writeFile(fileName, code, 'utf-8')
		})
	)
})();

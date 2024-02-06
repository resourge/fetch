import fs from 'fs';
import path from 'path';
import mergeDirs from 'recursive-copy';

async function getFiles(dir) {
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
	await mergeDirs('./packages/react-fetch/dist/react-fetch/src', './packages/react-fetch/dist', {
		overwrite: true
	})

	await fs.promises.rm('./packages/react-fetch/dist/http-service', {
		recursive: true
	})
	await fs.promises.rm('./packages/react-fetch/dist/react-fetch', {
		recursive: true
	})

	const declarationFiles = await getFiles('./packages/react-fetch/dist');

	await Promise.all(
		declarationFiles.map(async (fileName) => {
			let content = await fs.promises.readFile(fileName, 'utf-8');

			content = content.replace(/import '.*http-service\/.*';/g, '')

			const mat = content.match(/import (.*) from '.*http-service\/.*';/g) ?? [];

			const contentImports = [];

			if ( mat.length && !fileName.includes('.js.map')) {
				const firstIndex = content.indexOf(mat[0] || '')

				mat
				.forEach((found) => {
					const matImports = (found.match(/import\s(.*)\sfrom/g) ?? [])
					.map((matImport) => {
						matImport = matImport.replace('import ', '')
						matImport = matImport.replace(' from', '')
						matImport = matImport.replace('{ ', '')
						matImport = matImport.replace(' }', '')
						return matImport.split(', ');
					});

					contentImports.push(...matImports);
	
					content = content.replace(
						found,
						''
					)
				})

				const newHttpService = contentImports
				.filter((imp, index, arr) => arr.findIndex((val) => val === imp) === index)
				.flat()
				.join(', ');

				content = content.slice(0, firstIndex) + `import { ${newHttpService} } from '@resourge/http-service';` + content.slice(firstIndex);
			}

			await fs.promises.writeFile(fileName, content, 'utf-8');
		})
	)
})();

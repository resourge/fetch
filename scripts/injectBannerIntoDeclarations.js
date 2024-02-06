import fs from 'fs';
import minimist from 'minimist';
import path from 'path';

const myArgs = minimist(process.argv.slice(2));

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
	const declarationFiles = await getFiles(myArgs.folder);

	await Promise.all(
		declarationFiles.map(async (fileName) => {
			const content = await fs.promises.readFile(fileName, 'utf-8');

			await fs.promises.writeFile(fileName, [myArgs.text, content].join('\n'), 'utf-8');
		})
	)
})();

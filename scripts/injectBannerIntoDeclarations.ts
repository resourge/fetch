import fs from 'fs';
import path from 'path';
import minimist from 'minimist';

const myArgs = minimist(process.argv.slice(2));

async function getFiles(dir: string): Promise<string[]> {
	const dirFiles = await fs.promises.readdir(dir, { withFileTypes: true });
	const files = await Promise.all(dirFiles.map((dirent) => {
		const res = path.resolve(dir, dirent.name);
		return dirent.isDirectory() ? getFiles(res) : res;
	}));
	return Array.prototype.concat(...files);
}

(async () => {
	let declarationFiles = await getFiles(myArgs.folder);

	declarationFiles = declarationFiles
	.filter((fileName) => fileName.includes('.d.ts'))

	await Promise.all(
		declarationFiles.map(async (fileName) => {
			const content = await fs.promises.readFile(fileName, 'utf-8');

			return await fs.promises.writeFile(fileName, [myArgs.text, content].join('\n'), 'utf-8')
		})
	)

})();



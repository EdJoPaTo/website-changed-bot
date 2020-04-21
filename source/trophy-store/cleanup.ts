import {readdirSync, unlinkSync} from 'fs'

export function cleanup(folder: string, expectedFiles: ReadonlySet<string>): void {
	const superfluous = readdirSync(folder, {withFileTypes: true})
		.filter(o => o.isFile())
		.map(o => o.name)
		.filter(o => !expectedFiles.has(o))

	for (const file of superfluous) {
		unlinkSync(folder + file)
	}
}

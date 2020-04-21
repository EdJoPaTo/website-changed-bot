import {existsSync} from 'fs'
import {execSync} from 'child_process'

function commandLine(folder: string, ...additionalArguments: readonly string[]): string {
	return `git -C ${folder} ` + additionalArguments.join(' ')
}

function gitCommand(folder: string, ...additionalArguments: readonly string[]): string {
	const buffer = execSync(commandLine(folder, ...additionalArguments))
	return buffer.toString()
}

function tryCommit(folder: string): void {
	gitCommand(folder, 'add -A')
	try {
		gitCommand(folder, 'commit -m "update" --no-gpg-sign --author "website-changed-bot <website-changed-bot@3t0.de>"')
	} catch (error) {
		if ('stdout' in error && error.stdout instanceof Buffer) {
			const stdout = error.stdout.toString()
			if (stdout.includes('nothing to commit')) {
				return
			}

			console.log('git commit failed with unexpected error', stdout)
		}

		throw error
	}
}

export function update(folder: string): void {
	if (!existsSync('folder' + '.git')) {
		gitCommand(folder, 'init')
	}

	tryCommit(folder)
}

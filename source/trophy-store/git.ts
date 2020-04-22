import {existsSync} from 'fs'
import {execSync} from 'child_process'

function commandLine(folder: string, ...additionalArguments: readonly string[]): string {
	return `git -C ${folder} ` + additionalArguments.join(' ')
}

function gitCommand(folder: string, ...additionalArguments: readonly string[]): string {
	const buffer = execSync(commandLine(folder, ...additionalArguments))
	return buffer.toString()
}

function tryCommit(folder: string, commitMessage: string): void {
	gitCommand(folder, 'add -A')
	try {
		gitCommand(folder, `commit -m "${commitMessage}" --no-gpg-sign --author "website-changed-bot <website-changed-bot@3t0.de>"`)
	} catch (error) {
		if ('stdout' in error) {
			const {stdout} = error
			if (stdout instanceof Buffer) {
				const stdoutString = stdout.toString()
				if (stdoutString.includes('nothing to commit')) {
					return
				}

				console.log('git commit failed with unexpected error', stdoutString)
			}
		}

		throw error
	}
}

export function update(folder: string, commitMessage: string): void {
	if (!existsSync(folder + '.git')) {
		gitCommand(folder, 'init')
	}

	tryCommit(folder, commitMessage)
}

import {existsSync} from 'fs'

import {gitCommand} from './git'

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

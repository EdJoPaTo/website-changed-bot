import {execSync} from 'child_process'

function commandLine(folder: string, ...additionalArguments: readonly string[]): string {
	return `git -C ${folder} ` + additionalArguments.join(' ')
}

export function gitCommand(folder: string, ...additionalArguments: readonly string[]): string {
	const buffer = execSync(commandLine(folder, ...additionalArguments))
	return buffer.toString()
}

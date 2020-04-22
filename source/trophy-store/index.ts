import {Store} from '../store'
import {StringFileStore} from '../file-store'

import * as gitFolder from './git'
import * as cleanupFolder from './cleanup'

function folder(issuer: string): string {
	return `websites/folders/${issuer}/`
}

export function getStore(issuer: string): Store<string> {
	return new StringFileStore(folder(issuer))
}

export function finalizeStore(issuer: string, expectedFiles: readonly string[]): void {
	const f = folder(issuer)
	cleanupFolder.cleanup(f, new Set(expectedFiles))
	gitFolder.update(f)
}

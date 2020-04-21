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

export function updateGit(issuer: string): void {
	gitFolder.update(folder(issuer))
}

export function cleanup(issuer: string, expectedFiles: readonly string[]): void {
	cleanupFolder.cleanup(folder(issuer), new Set(expectedFiles))
}

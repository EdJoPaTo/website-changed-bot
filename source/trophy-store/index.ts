import {Store} from '../store'
import {StringFileStore} from '../file-store'

import {cleanup} from './cleanup'
import * as gitRepo from './git-repo'

function folderOfIssuer(issuer: string): string {
	return `websites/folders/${issuer}/`
}

export function getStore(issuer: string): Store<string> {
	return new StringFileStore(folderOfIssuer(issuer))
}

export function finalizeStore(issuer: string, expectedFiles: readonly string[]): void {
	const folder = folderOfIssuer(issuer)
	cleanup(folder, new Set(expectedFiles))
	gitRepo.update(folder, 'update')
}

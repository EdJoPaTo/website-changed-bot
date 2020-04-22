import {Store} from '../store'
import {StringFileStore} from '../file-store'

import {cleanup} from './cleanup'
import * as gitFolder from './git'

function folderOfIssuer(issuer: string): string {
	return `websites/folders/${issuer}/`
}

export function getStore(issuer: string): Store<string> {
	return new StringFileStore(folderOfIssuer(issuer))
}

export function finalizeStore(issuer: string, expectedFiles: readonly string[]): void {
	const folder = folderOfIssuer(issuer)
	gitFolder.update(folder, 'update')
	cleanup(folder, new Set(expectedFiles))
	gitFolder.update(folder, 'cleanup')
}

import {Mission} from '../mission'

import {Store} from '../store'

import {getCurrent as getHead} from './head'
import {getCurrent as getHtml} from './html'
import {getCurrent as getJavaScript} from './javascript'
import {getCurrent as getText} from './text'

export * from './mission'

async function getCurrent(mission: Mission): Promise<string> {
	switch (mission.type) {
		case 'head': return getHead(mission)
		case 'html': return getHtml(mission)
		case 'js': return getJavaScript(mission)
		case 'txt': return getText(mission)
		default: throw new Error(`A hunter for this mission type was not implemented yet: ${(mission as any).type as string}`)
	}
}

export async function hasChanged(contentCache: Store<string>, mission: Mission): Promise<boolean | undefined> {
	const contentName = mission.uniqueIdentifier + '.' + mission.type
	const newContent = await getCurrent(mission)

	const oldContent = contentCache.get(contentName)
	if (oldContent === undefined) {
		contentCache.set(contentName, newContent)
		return undefined
	}

	if (oldContent !== newContent) {
		contentCache.set(contentName, newContent)
		return true
	}

	return false
}

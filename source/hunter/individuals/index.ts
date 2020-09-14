import {Mission} from '../mission'

import {getHtml} from './html'
import {getJavaScript} from './javascript'
import {getText} from './text'
import {getXml} from './xml'

export async function getCurrent(mission: Mission): Promise<string> {
	switch (mission.type) {
		case 'html': return getHtml(mission)
		case 'js': return getJavaScript(mission)
		case 'txt': return getText(mission)
		case 'xml': return getXml(mission)
		default: throw new Error(`A hunter for this mission type was not implemented yet: ${(mission as any).type as string}`)
	}
}

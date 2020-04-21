import {TextMission} from '../mission'

import {cachedGot} from './got'

export async function getCurrent(entry: TextMission): Promise<string> {
	const response = await cachedGot(entry.url)
	const {body} = response
	return body
}

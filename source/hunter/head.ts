import {HeadMission} from '../mission'

import {cachedGot} from './got'

export async function getCurrent(entry: HeadMission): Promise<string> {
	const ignoreHeader = new Set(entry.ignoreHeader ?? [])

	const response = await cachedGot.head(entry.url)
	const {headers} = response

	const keys = Object.keys(headers)
		.filter(o => !ignoreHeader.has(o))
		.sort((a, b) => a.localeCompare(b))
	const text = keys
		.map(o => `${o}: ${headerValueToString(headers[o])}`)
		.join('\n')
	return text + '\n'
}

function headerValueToString(value: string | readonly string[] | undefined): string {
	if (typeof value === 'string') {
		return value
	}

	if (!value) {
		return ''
	}

	return `[${value.join(';')}]`
}

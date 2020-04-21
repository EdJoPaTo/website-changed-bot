import {js as beautifyJS} from 'js-beautify'

import {JavaScriptMission} from '../mission'

import {cachedGot} from './got'

const requiredWords = ['function', 'var', 'const']

export async function getCurrent(entry: JavaScriptMission): Promise<string> {
	const response = await cachedGot(entry.url)
	const {body} = response
	if (!requiredWords.some(o => body.includes(o))) {
		throw new Error('The response body does not seem like JavaScript')
	}

	const beautified = beautifyJS(body, {indent_with_tabs: true})
	return beautified
}

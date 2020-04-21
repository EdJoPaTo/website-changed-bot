import {html as beautifyHtml} from 'js-beautify'

import {HtmlMission} from '../mission'

import {cachedGot} from './got'

export async function getCurrent(entry: HtmlMission): Promise<string> {
	const response = await cachedGot(entry.url)
	const {body} = response
	if (!/<html/i.test(body)) {
		throw new Error('The response body does not seem like html')
	}

	const beautified = beautifyHtml(body, {indent_with_tabs: true})
	return beautified
}

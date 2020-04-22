import {html as beautifyHtml} from 'js-beautify'

import {cachedGot} from '../got'
import {HtmlMission} from '../mission'

export async function getHtml(entry: HtmlMission): Promise<string> {
	const response = await cachedGot(entry.url)
	const {body} = response
	if (!/<html/i.test(body)) {
		throw new Error('The response body does not seem like html')
	}

	const beautified = beautifyHtml(body, {indent_with_tabs: true})
	return beautified
}
import {html as beautifyHtml} from 'js-beautify'

import {cachedGot} from '../got'
import {XmlMission} from '../mission'

export async function getXml(entry: XmlMission): Promise<string> {
	const response = await cachedGot(entry.url)
	const {body} = response
	if (!/<\?xml/i.test(body)) {
		throw new Error('The response body does not seem like xml')
	}

	const beautified = beautifyHtml(body, {
		end_with_newline: true,
		eol: '\n',
		indent_with_tabs: true,
		max_preserve_newlines: 2
	})
	return beautified
}

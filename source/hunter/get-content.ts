import * as beautify from 'js-beautify'
import * as jsonStableStringify from 'json-stable-stringify'

import {cachedGot} from './got'
import {Mission} from './mission'

const JAVASCRIPT_REQUIRED_WORDS = ['function', 'var', 'const']

const BEAUTIFY_OPTIONS = {
	end_with_newline: true,
	eol: '\n',
	indent_with_tabs: true,
	max_preserve_newlines: 2
}

export async function getCurrent(entry: Mission): Promise<string> {
	const response = await cachedGot(entry.url)
	const {body} = response

	// eslint-disable-next-line default-case
	switch (entry.type) {
		case 'html':
			if (!/<html/i.test(body)) {
				throw new Error('The response body does not seem like html')
			}

			return beautify.html(body, BEAUTIFY_OPTIONS)
		case 'js':
			if (!JAVASCRIPT_REQUIRED_WORDS.some(o => body.includes(o))) {
				throw new Error('The response body does not seem like JavaScript')
			}

			return beautify.js(body, BEAUTIFY_OPTIONS)

		case 'txt':
			return body
		case 'xml':
			if (!/<\?xml/i.test(body)) {
				throw new Error('The response body does not seem like xml')
			}

			return beautify.html(body, BEAUTIFY_OPTIONS)
		case 'json':
			return jsonStableStringify(JSON.parse(body), {space: '\t'})
		// Typescript detects missing cases in this switch case. No need for default then.
		// default: throw new Error(`A hunter for this mission type was not implemented yet: ${(entry as any).type as string}`)
	}
}

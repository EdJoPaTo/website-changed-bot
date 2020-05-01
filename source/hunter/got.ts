import {readFileSync} from 'fs'

import got from 'got'

// TODO: implement cache
// const cache = new Map<string, string>()
// When using the cache got might return 304 but no content.
// As its possible that users have the same url multiple times there should be a cache in the first place to prevent multiple calls to the same url
// Also make sure to serve from own cache when 304 is returned

function getVersion(): string {
	const content = readFileSync('package.json', 'utf8')
	const json = JSON.parse(content)
	return json.version
}

export const cachedGot = got.extend({
	headers: {
		'user-agent': 'website-changed-bot ' + getVersion() + 'https://github.com/EdJoPaTo/website-changed-bot'
	}
})

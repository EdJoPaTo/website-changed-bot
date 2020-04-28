import got from 'got'

import * as packageJson from '../../package.json'

// TODO: implement cache
// const cache = new Map<string, string>()
// When using the cache got might return 304 but no content.
// As its possible that users have the same url multiple times there should be a cache in the first place to prevent multiple calls to the same url
// Also make sure to serve from own cache when 304 is returned

export const cachedGot = got.extend({
	headers: {
		'user-agent': 'WebsiteChangedBot ' + packageJson.version + ' https://github.com/EdJoPaTo/WebsiteChangedBot'
	}
})

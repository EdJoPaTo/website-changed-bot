import got from 'got'

const cache = new Map<string, string>()

export const cachedGot = got.extend({
	cache
})

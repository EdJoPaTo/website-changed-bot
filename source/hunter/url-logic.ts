export function getDomainFromUrl(url: string): string {
	const result = /\/\/([^/]+)/.exec(url)
	if (!result) {
		throw new Error('could not find domain in url ' + url)
	}

	return result[1]
}

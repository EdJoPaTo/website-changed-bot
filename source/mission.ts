export function generateUniqueKeyForUrl(url: string): string {
	return url
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.replace(/[-_:;*?"<>|.&=/\\]+/g, ' ')
		.trim()
		.replace(/ +/g, '-')
}

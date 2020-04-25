export function generateUniqueKeyForUrl(url: string): string {
	return url.replace(/[-_:;*?"<>|.&=/\\]+/g, ' ').trim().replace(/ +/g, '-')
}

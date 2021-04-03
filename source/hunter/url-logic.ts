import {Type} from './mission.js'

export function getDomainFromUrl(url: string): string {
	const result = /\/\/([^/]+)/.exec(url)
	if (!result) {
		throw new Error('could not find domain in url ' + url)
	}

	return result[1]!
}

function generateUniqueKeyForUrl(url: string, type: Type): string {
	const trimmed = url
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.replace(new RegExp('\\.' + type + '$'), '')
		.replace(/index$/, '')

	const domainMatch = /^[^/]+/.exec(trimmed)
	const domain = domainMatch ? domainMatch[0]! : trimmed
	const reverseDomain = domain.split('.').reverse().join('.')

	const withReversedDomain = reverseDomain + trimmed.slice(domain.length)

	return withReversedDomain
		.replace(/[-_:;*?"<>|.&=/\\]+/g, ' ')
		.trim()
		.replace(/ +/g, '-')
}

export function generateFilename(url: string, type: Type): string {
	return generateUniqueKeyForUrl(url, type) + '.' + type
}

import test, {ExecutionContext} from 'ava'

import {Type} from './mission.js'

import {getDomainFromUrl, generateFilename} from './url-logic.js'

function getDomainFromUrlMacro(t: ExecutionContext, input: string, expected: string): void {
	const actual = getDomainFromUrl(input)
	t.is(actual, expected)
}

getDomainFromUrlMacro.title = (_name: string, input: string) => {
	return 'getDomainFromUrl ' + input
}

test(getDomainFromUrlMacro, 'http://edjopato.de', 'edjopato.de')
test(getDomainFromUrlMacro, 'https://edjopato.de', 'edjopato.de')
test(getDomainFromUrlMacro, 'http://edjopato.de/', 'edjopato.de')
test(getDomainFromUrlMacro, 'https://edjopato.de/', 'edjopato.de')
test(getDomainFromUrlMacro, 'http://edjopato.de/blog', 'edjopato.de')
test(getDomainFromUrlMacro, 'https://edjopato.de/blog', 'edjopato.de')
test(getDomainFromUrlMacro, 'https://test.edjopato.de/blog', 'test.edjopato.de')

function generateFilenameMacro(t: ExecutionContext, url: string, type: Type, expected: string): void {
	const actual = generateFilename(url, type)
	t.is(actual, expected)
}

generateFilenameMacro.title = (_name: string, url: string, type: Type) => {
	return type + ' ' + url
}

test(generateFilenameMacro, 'https://edjopato.de', 'html', 'de-edjopato.html')
test(generateFilenameMacro, 'https://edjopato.de/', 'html', 'de-edjopato.html')
test(generateFilenameMacro, 'https://www.edjopato.de', 'html', 'de-edjopato.html')
test(generateFilenameMacro, 'https://test.edjopato.de', 'html', 'de-edjopato-test.html')
test(generateFilenameMacro, 'https://edjopato.de/blog', 'html', 'de-edjopato-blog.html')
test(generateFilenameMacro, 'https://test.edjopato.de/blog', 'html', 'de-edjopato-test-blog.html')
test(generateFilenameMacro, 'https://edjopato.de/index.html', 'html', 'de-edjopato.html')
test(generateFilenameMacro, 'https://edjopato.de/index.html', 'xml', 'de-edjopato-index-html.xml')

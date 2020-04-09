import {promises as fsPromises} from 'fs'

import got from 'got'
import {html as beautifyHtml} from 'js-beautify'

const {readFile, writeFile} = fsPromises

const WEBSITES_FOLDER = './websites/'

async function getBody(uri: string): Promise<string> {
	const response = await got(uri)

	if (response.statusCode !== 200) {
		throw new Error(`Receiving the website was unsuccessful: ${response.statusCode} ${response.statusMessage ?? 'undefined'}`)
	}

	return response.body
}

function getFilenameOfName(name: string): string {
	const filename = name.replace(/[ ./]+/g, '-')
	return `${WEBSITES_FOLDER}${filename}.html`
}

async function hasBodyChanged(name: string, currentWebsiteBody: string): Promise<boolean | undefined> {
	const filename = getFilenameOfName(name)

	try {
		const oldContent = await readFile(filename, 'utf8')
		if (oldContent === currentWebsiteBody) {
			// Nothing has changed
			return false
		}

		// Has changed
		await writeFile(filename, currentWebsiteBody, 'utf8')

		return true
	} catch (_) {
		// There isn't an old version yet… create
		await writeFile(filename, currentWebsiteBody, 'utf8')
		return undefined
	}
}

export async function hasChanged(name: string, uri: string): Promise<boolean | undefined> {
	const body = await getBody(uri)
	const beautified = beautifyHtml(body)
	return hasBodyChanged(name, beautified)
}

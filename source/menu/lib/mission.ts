import {Formatter} from 'telegram-format'

import {Mission, ContentReplace, generateFilename} from '../../hunter/index.js'

export function basicInfo(format: Formatter, mission: Mission): string {
	let text = ''
	text += format.bold(generateFilename(mission.url, mission.type))
	text += '\n'

	text += format.bold('Url')
	text += ': '
	text += format.escape(mission.url)
	text += '\n'

	text += format.bold('Type')
	text += ': '
	text += format.escape(mission.type)
	text += '\n'

	return text
}

export function singleReplacerLine(format: Formatter, replacer: ContentReplace, index?: number): string {
	const {source, flags, replaceValue} = replacer
	const regex = '/' + source + '/' + flags
	let text = ''

	if (index !== undefined) {
		text += index
		text += ': '
	}

	text += format.monospace(regex)
	text += ' '
	if (replaceValue) {
		text += '▶️'
		text += ' '
		text += format.monospace(replaceValue)
	} else {
		text += '⏹'
	}

	return text
}

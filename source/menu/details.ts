import {MenuTemplate, Body} from 'telegraf-inline-menu/dist/next-gen'
import {html as format} from 'telegram-format'

import {getByIndex} from '../user-missions'
import {Mission} from '../hunter'

import {Context} from './context'
import {backButtons} from './back-buttons'
import {singleReplacerLines, basicInfo} from './lib/mission'

import {menu as editContentReplacerMenu} from './edit-content-replacers'

export const menu = new MenuTemplate<Context>(menuBody)

menu.submenu('Edit Content Replacers…', 'replacers', editContentReplacerMenu)

menu.manualRow(backButtons)

function getMission(context: Context): Mission {
	const index = Number(context.match![1])
	return getByIndex(`tg${context.from!.id}`, index)
}

function menuBody(context: Context): Body {
	const mission = getMission(context)
	let text = ''

	text += basicInfo(format, mission)

	if (mission.type === 'head' && mission.ignoreHeader) {
		text += format.bold('Ignore Header')
		text += ':\n'
		text += mission.ignoreHeader
			.map(o => `- ${o}`)
			.sort((a, b) => a.localeCompare(b))
			.map(o => format.escape(o))
			.join('\n')
		text += '\n'
	}

	if (mission.contentReplace.length > 0) {
		text += format.bold('Content Replace')
		text += ':\n'

		text += mission.contentReplace
			.map(o => singleReplacerLines(format, o))
			.join('')
	}

	return {text, parse_mode: format.parse_mode}
}

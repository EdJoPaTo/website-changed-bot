import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {html as format} from 'telegram-format'

import * as userMissions from '../user-missions'
import {Mission} from '../hunter'

import {Context} from './context'
import {backButtons} from './back-buttons'
import {singleReplacerLines, basicInfo} from './lib/mission'

import {menu as addContentReplacerMenu} from './add-content-replacer'
import {menu as removeContentReplacerMenu} from './remove-content-replacers'

export const menu = new MenuTemplate<Context>(menuBody)

menu.submenu('Add Content Replacer…', 'replacer-add', addContentReplacerMenu)

menu.submenu('Remove Content Replacer…', 'replacer-remove', removeContentReplacerMenu, {
	leaveOnChildInteraction: true,
	hide: async context => {
		const mission = getMission(context)
		return !mission.contentReplace?.length
	}
})

menu.interact('Remove Mission', 'remove', {
	do: async (context, next) => {
		const issuer = `tg${context.from!.id}`
		const mission = getMission(context)
		userMissions.remove(issuer, mission)

		return next()
	}
})

menu.manualRow(backButtons)

function getMission(context: Context): Mission {
	const key = context.match![1]
	const index = Number(/^i(\d+)-/.exec(key)![1])
	return userMissions.getByIndex(`tg${context.from!.id}`, index)
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

	if (mission.contentReplace?.length) {
		text += format.bold('Content Replace')
		text += ':\n'

		text += mission.contentReplace
			.map(o => singleReplacerLines(format, o))
			.join('')
	}

	return {text, parse_mode: format.parse_mode}
}

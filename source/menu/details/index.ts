import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {html as format} from 'telegram-format'

import {Context} from '../../context.js'
import {Mission} from '../../hunter/index.js'
import * as userMissions from '../../user-missions.js'

import {backButtons} from '../lib/generics.js'
import {singleReplacerLine, basicInfo} from '../lib/mission.js'

import {menu as addContentReplacerMenu} from './add-content-replacer.js'
import {menu as removeContentReplacerMenu} from './remove-content-replacers.js'

export const menu = new MenuTemplate<Context>(menuBody)

menu.submenu('Add Content Replacer…', 'replacer-add', addContentReplacerMenu)

menu.submenu('Remove Content Replacer…', 'replacer-remove', removeContentReplacerMenu, {
	hide: async context => {
		const mission = getMission(context)
		return !mission.contentReplace?.length
	}
})

const removeMissionMenu = new MenuTemplate<Context>(context => {
	const mission = getMission(context)
	let text = ''

	text += basicInfo(format, mission)
	text += '\n'
	text += 'Are you sure to remove this mission?'
	return {text, parse_mode: format.parse_mode}
})

removeMissionMenu.interact('Yes, remove the mission!', 'yes', {
	do: async context => {
		const issuer = `tg${context.chat!.id}`
		const mission = getMission(context)
		userMissions.remove(issuer, mission)

		return '../..'
	}
})

removeMissionMenu.navigate('Nope! Keep it!', '..')

menu.submenu('Remove Mission', 'remove', removeMissionMenu)

menu.manualRow(backButtons)

function getMission(context: Context): Mission {
	const issuer = `tg${context.chat!.id}`
	const key = context.match![1]!
	const index = Number(/^i(\d+)-/.exec(key)?.[1])
	return userMissions.getByIndex(issuer, index)
}

function menuBody(context: Context): Body {
	const mission = getMission(context)
	let text = ''

	text += basicInfo(format, mission)

	if (mission.contentReplace?.length) {
		text += format.bold('Content Replace')
		text += ':\n'

		text += mission.contentReplace
			.map(o => singleReplacerLine(format, o))
			.join('\n')
	}

	return {text, parse_mode: format.parse_mode}
}

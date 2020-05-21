import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {html as format} from 'telegram-format'

import {getByIndex, update} from '../user-missions'
import {Mission} from '../hunter'

import {Context} from './context'
import {backButtons} from './back-buttons'
import {singleReplacerLines, basicInfo} from './lib/mission'

export const menu = new MenuTemplate<Context>(menuBody)

menu.choose('remove', currentContentReplaceIndicies, {
	columns: 3,
	buttonText: (_, key) => {
		const index = Number(key)
		return `remove ${index + 1}`
	},
	do: async (context, key) => {
		if (key) {
			const index = Number(key)
			const mission = getMission(context)
			if (!mission.contentReplace) {
				return
			}

			const newReplacers = [...mission.contentReplace]
			newReplacers.splice(index, 1)
			const newMission = {
				...mission,
				contentReplace: newReplacers
			}

			update(`tg${context.from!.id}`, newMission)
		}

		return '..'
	}
})

menu.manualRow(backButtons)

function getMission(context: Context): Mission {
	const key = context.match![1]
	const index = Number(/^i(\d+)-/.exec(key)![1])
	return getByIndex(`tg${context.from!.id}`, index)
}

function menuBody(context: Context): Body {
	const mission = getMission(context)
	let text = ''

	text += basicInfo(format, mission)

	text += '\n'

	if (mission.contentReplace?.length) {
		text += mission.contentReplace
			.map(o => singleReplacerLines(format, o))
			.join('')
	} else {
		text += 'none created yet'
	}

	return {text, parse_mode: format.parse_mode}
}

function currentContentReplaceIndicies(context: Context): string[] {
	const replacers = getMission(context).contentReplace
	if (!replacers) {
		return []
	}

	return replacers.map((_, i) => String(i))
}

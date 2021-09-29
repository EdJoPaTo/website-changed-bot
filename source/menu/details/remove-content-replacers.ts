import {MenuTemplate, Body} from 'grammy-inline-menu'
import {html as format} from 'telegram-format'

import {Context} from '../../context.js'
import {getByIndex, update} from '../../user-missions.js'
import {Mission} from '../../hunter/index.js'

import {backButtons} from '../lib/generics.js'
import {singleReplacerLine, basicInfo} from '../lib/mission.js'

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
				return true
			}

			const newReplacers = [...mission.contentReplace]
			newReplacers.splice(index, 1)
			const newMission = {
				...mission,
				contentReplace: newReplacers,
			}

			const issuer = `tg${context.chat!.id}`
			update(issuer, newMission)
		}

		return '..'
	},
})

menu.manualRow(backButtons)

function getMission(context: Context): Mission {
	const issuer = `tg${context.chat!.id}`
	const key = context.match![1]!
	const index = Number(/^i(\d+)-/.exec(key)?.[1])
	return getByIndex(issuer, index)
}

function menuBody(context: Context): Body {
	const mission = getMission(context)
	let text = ''

	text += basicInfo(format, mission)

	text += '\n'

	if (mission.contentReplace?.length) {
		text += mission.contentReplace
			.map((o, i) => singleReplacerLine(format, o, i + 1))
			.join('\n')
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

import {MenuTemplate, Body} from 'telegraf-inline-menu/next-gen'
import {html as format} from 'telegram-format'

import {getByIndex, update} from '../user-missions'
import {Mission} from '../hunter'

import {Context} from './context'
import {backButtons} from './back-buttons'
import {singleReplacerLines, basicInfo} from './lib/mission'

export const menu = new MenuTemplate<Context>(menuBody)

menu.choose('remove', currentContentReplaceIndicies, {
	buttonText: (_, key) => {
		const index = Number(key)
		return `remove ${index + 1}`
	},
	do: async (context, next, key) => {
		if (key) {
			const index = Number(key)
			const mission = getMission(context)

			const newReplacers = [...mission.contentReplace]
			newReplacers.splice(index, 1)
			const newMission = {
				...mission,
				contentReplace: newReplacers
			}

			update(`tg${context.from!.id}`, newMission)
		}

		return next()
	}
})

menu.interact('Add…', 'add', {
	do: ctx => ctx.answerCbQuery('TODO')
})

menu.manualRow(backButtons)

function getMission(context: Context): Mission {
	const index = Number(context.match![1])
	return getByIndex(`tg${context.from!.id}`, index)
}

function menuBody(context: Context): Body {
	const mission = getMission(context)
	let text = ''

	text += basicInfo(format, mission)

	text += '\n'
	text += format.bold('Content Replace')
	text += '\n'

	let infoText = 'Content Replacers are Regular Expressions used after the content is downloaded to remove parts without interest.\n'
	infoText += 'They use JavaScripts String.replace [1] under the hood. '
	infoText += 'This means they have a Regular Expression and a replaceValue.\n'

	text += format.escape(infoText)
	text += format.escape('[1] ')
	text += format.url(format.escape('JavaScript String.replace Documentation'), 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace')
	text += '\n'

	text += '\n'

	if (mission.contentReplace.length > 0) {
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
	return replacers.map((_, i) => String(i))
}

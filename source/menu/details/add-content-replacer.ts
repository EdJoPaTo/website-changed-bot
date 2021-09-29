import {Composer} from 'grammy'
import {html as format} from 'telegram-format'
import {MenuTemplate, Body, replyMenuToContext, deleteMenuFromContext, getMenuOfPath} from 'grammy-inline-menu'
import {StatelessQuestion} from '@grammyjs/stateless-question'

import {ContentReplace} from '../../hunter/index.js'
import {Context} from '../../context.js'
import * as userMissions from '../../user-missions.js'

import {basicInfo} from '../lib/mission.js'

const DEFAULT_FLAGS = 'g'
const DEFAULT_REPLACE_VALUE = '$1'

export const bot = new Composer<Context>()
export const menu = new MenuTemplate<Context>(menuBody)

const regexQuestion = new StatelessQuestion<Context>('replacer-regex', async (context, path) => {
	const regex = 'text' in context.message && context.message.text
	if (!regex) {
		await context.reply('Please send the regular expression as a text message')
		await replyMenuToContext(menu, context, path)
		return
	}

	try {
		const flags = context.session.replacerRegexFlags ?? DEFAULT_FLAGS
		new RegExp(regex, flags).test('edjopato')
		context.session.replacerRegexSource = regex
	} catch {
		await context.reply('That did not seem like a valid regular expression')
	}

	await replyMenuToContext(menu, context, path)
})

bot.use(regexQuestion.middleware())

menu.interact('Set the Regular Expression…', 'regex', {
	do: async (context, path) => {
		await Promise.all([
			regexQuestion.replyWithMarkdown(context, 'Please tell me the regexp you wanna use.', getMenuOfPath(path)),
			deleteMenuFromContext(context),
		])
		return false
	},
})

const regexFlags = {
	g: 'global',
	i: 'ignore case',
	m: 'multiline',
	u: 'unicode',
}

menu.select('flags', regexFlags, {
	columns: 2,
	showFalseEmoji: true,
	isSet: (context, key) => (context.session.replacerRegexFlags ?? DEFAULT_FLAGS).includes(key),
	set: (context, key, newState) => {
		const old = context.session.replacerRegexFlags ?? DEFAULT_FLAGS
		const set = new Set(old)
		if (newState) {
			set.add(key)
		} else {
			set.delete(key)
		}

		context.session.replacerRegexFlags = [...set]
			.sort((a, b) => a.localeCompare(b))
			.join('')

		return true
	},
})

const replaceValueQuestion = new StatelessQuestion<Context>('replacer-replace-value', async (context, path) => {
	const replaceValue = 'text' in context.message ? context.message.text : undefined
	context.session.replacerReplaceValue = replaceValue
	await replyMenuToContext(menu, context, path)
})

bot.use(replaceValueQuestion.middleware())

menu.interact('Replace with…', 'replaceValue', {
	hide: context => !context.session.replacerRegexSource,
	do: async (context, path) => {
		await Promise.all([
			replaceValueQuestion.replyWithMarkdown(context, 'Please tell me the replaceValue you wanna use.', getMenuOfPath(path)),
			deleteMenuFromContext(context),
		])
		return false
	},
})

menu.interact('Remove matches', 'replaceEmpty', {
	joinLastRow: true,
	hide: context => !context.session.replacerRegexSource,
	do: async context => {
		context.session.replacerReplaceValue = ''
		return true
	},
})

menu.interact('🛑 Abort', 'abort', {
	do: async context => {
		delete context.session.replacerRegexSource
		delete context.session.replacerRegexFlags
		delete context.session.replacerReplaceValue
		return '..'
	},

})

menu.interact('✅ Add', 'add', {
	joinLastRow: true,
	hide: context => !context.session.replacerRegexSource,
	do: async context => {
		if (!context.session.replacerRegexSource) {
			await context.answerCallbackQuery({text: 'you need to specify a source'})
			return false
		}

		const source = context.session.replacerRegexSource
		const flags = context.session.replacerRegexFlags ?? DEFAULT_FLAGS
		const replaceValue = context.session.replacerReplaceValue ?? DEFAULT_REPLACE_VALUE

		const data = context.callbackQuery && 'data' in context.callbackQuery ? context.callbackQuery.data : undefined

		const index = /\/:i(\d+)-/.exec(data!)?.[1]
		const issuer = `tg${context.chat!.id}`
		const mission = userMissions.getByIndex(issuer, Number(index))

		const newReplacers: ContentReplace[] = [
			...(mission.contentReplace ?? []),
			{source, flags, replaceValue},
		]

		userMissions.update(issuer, {...mission, contentReplace: newReplacers})

		delete context.session.replacerRegexSource
		delete context.session.replacerRegexFlags
		delete context.session.replacerReplaceValue

		await context.answerCallbackQuery({text: 'added successfully 😎'})
		return '..'
	},
})

function menuBody(context: Context, path: string): Body {
	let text = ''

	const index = Number(/:i(\d+)/.exec(path)?.[1])
	const issuer = `tg${context.chat!.id}`
	const mission = userMissions.getByIndex(issuer, index)
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
	text += '\n\n'

	const {replacerRegexSource: source, replacerRegexFlags: flags, replacerReplaceValue: replaceValue} = context.session

	if (source) {
		const regex = '/' + source + '/' + (flags ?? DEFAULT_FLAGS)
		text += format.bold('Regular Expression')
		text += ':\n'
		text += format.monospaceBlock(regex, 'js')
		text += '\n'

		text += format.bold('Replace with')
		text += ': '
		text += format.monospace(replaceValue ?? DEFAULT_REPLACE_VALUE)
		text += '\n'

		text += '\n'
		text += 'this basically results in the JavaScript equivalent of'
		text += '\n'

		const js = `content.replace(\n  /${source}/${flags ?? DEFAULT_FLAGS},\n  '${replaceValue ?? DEFAULT_REPLACE_VALUE}'\n)`
		text += format.monospaceBlock(js, 'js')
		text += '\n'
	}

	return {text, parse_mode: format.parse_mode}
}

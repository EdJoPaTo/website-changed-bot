import {Composer} from 'telegraf'
import {html as format} from 'telegram-format'
import {MenuTemplate, replyMenuToContext, Body, deleteMenuFromContext} from 'telegraf-inline-menu'
import TelegrafStatelessQuestion from 'telegraf-stateless-question'

import {Context} from '../context'
import {getStore} from '../trophy-store'
import {TYPES, stringIsType, Mission, hasChanged, generateFilename} from '../hunter'
import * as userMissions from '../user-missions'

import {backButtons} from './lib/generics'
import {basicInfo} from './lib/mission'

const DEFAULT_TYPE = 'html'

export const bot = new Composer<Context>()

export const menu = new MenuTemplate<Context>(menuBody)

const urlQuestion = new TelegrafStatelessQuestion<Context>('add-url', async context => {
	const url = 'text' in context.message && context.message.text
	if (!url) {
		await context.reply('Please send the url as a text message')
	} else if (!(url.startsWith('https://') || url.startsWith('http://'))) {
		await context.reply('The url has to start with https:// or http://')
	} else if (url.includes('\n')) {
		await context.reply('Please only include one url and without linebreaks')
	} else {
		context.session.addUrl = url
	}

	await replyMenuToContext(menu, context, '/add/')
})

bot.use(urlQuestion.middleware())

menu.interact('Set the url…', 'url', {
	do: async context => {
		await Promise.all([
			urlQuestion.replyWithMarkdown(context, 'Please tell me the url you want to spy upon.'),
			deleteMenuFromContext(context)
		])
		return false
	}
})

menu.select('type', TYPES, {
	isSet: (context, key) => (context.session.addType ?? DEFAULT_TYPE) === key,
	set: (context, key) => {
		if (stringIsType(key)) {
			context.session.addType = key
		}

		return true
	}
})

menu.interact('Reset', 'reset', {
	hide: context => {
		return !context.session.addUrl && (context.session.addType ?? DEFAULT_TYPE) === DEFAULT_TYPE
	},
	do: async context => {
		delete context.session.addType
		delete context.session.addUrl
		return '.'
	}
})

menu.interact('Add', 'add', {
	joinLastRow: true,
	hide: context => {
		if (!context.session.addUrl) {
			return true
		}

		if (similarUrlExists(context)) {
			return true
		}

		return false
	},
	do: async context => {
		if (!context.session.addUrl) {
			return '.'
		}

		const issuer = `tg${context.chat!.id}`
		const mission: Mission = {
			type: context.session.addType ?? DEFAULT_TYPE,
			url: context.session.addUrl,
			contentReplace: []
		}

		try {
			await hasChanged(mission, getStore(issuer))

			userMissions.add(issuer, mission)

			delete context.session.addType
			delete context.session.addUrl

			await context.answerCbQuery('added successfully 😎')
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			await context.reply(errorMessage)
		}

		return '.'
	}
})

menu.manualRow(backButtons)

function menuBody(context: Context): Body {
	let text = 'Lets add a website to be stalked 🤓\n\n'

	if (context.session.addUrl) {
		text += format.bold('Url')
		text += ': '
		text += format.escape(context.session.addUrl)
		text += '\n'

		text += format.bold('Type')
		text += ': '
		text += format.escape(context.session.addType ?? DEFAULT_TYPE)
		text += '\n'
	}

	text += '\n'

	const similar = similarUrlExists(context)
	if (similar) {
		text += '⚠️'
		text += 'You already have something similar:'
		text += '\n'
		text += basicInfo(format, similar)
	}

	return {text, parse_mode: format.parse_mode}
}

function similarUrlExists(context: Context): Mission | undefined {
	if (!context.session.addUrl) {
		return undefined
	}

	const filename = generateFilename(context.session.addUrl, context.session.addType ?? DEFAULT_TYPE)

	const issuer = `tg${context.chat!.id}`
	const existingMissions = userMissions.getAll(issuer)
	return existingMissions
		.find(o => filename === generateFilename(o.url, o.type))
}

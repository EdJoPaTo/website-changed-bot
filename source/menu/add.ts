import {Composer} from 'telegraf'
import {html as format} from 'telegram-format'
import {MenuTemplate, replyMenuToContext, Body} from 'telegraf-inline-menu'
import TelegrafStatelessQuestion from 'telegraf-stateless-question'

import {backButtons} from './back-buttons'
import {basicInfo} from './lib/mission'
import {Context} from './context'
import {getStore} from '../trophy-store'
import {TYPES, stringIsType, Mission, hasChanged} from '../hunter'
import * as userMissions from '../user-missions'

export const bot = new Composer<Context>()

export const menu = new MenuTemplate<Context>(menuBody)

const urlQuestion = new TelegrafStatelessQuestion<Context>('add-url', async context => {
	const url = context.message.text
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
			context.deleteMessage().catch(() => {/* ignore */})
		])
	}
})

menu.select('type', TYPES, {
	isSet: (context, key) => context.session.addType === key,
	set: (context, key) => {
		if (key === undefined || stringIsType(key)) {
			context.session.addType = key
		}
	}
})

menu.interact('Reset', 'reset', {
	hide: context => {
		return !context.session.addType && !context.session.addUrl
	},
	do: async (context, next) => {
		delete context.session.addType
		delete context.session.addUrl
		return next()
	}
})

menu.interact('Add', 'add', {
	joinLastRow: true,
	hide: context => {
		if (!context.session.addUrl || !context.session.addType) {
			return true
		}

		if (similarUrlExists(context)) {
			return true
		}

		return false
	},
	do: async (context, next) => {
		if (!context.session.addUrl || !context.session.addType) {
			return next()
		}

		const issuer = `tg${context.from!.id}`
		const mission: Mission = {
			type: context.session.addType,
			url: context.session.addUrl,
			contentReplace: []
		}

		try {
			await hasChanged(mission, getStore(issuer))

			userMissions.add(issuer, mission)

			delete context.session.addType
			delete context.session.addUrl

			await context.answerCbQuery('added successfully 😎')
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			await context.answerCbQuery(errorMessage, true)
		}

		return next()
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
	}

	if (context.session.addType) {
		text += format.bold('Type')
		text += ': '
		text += format.escape(context.session.addType)
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
	if (!context.session.addUrl || !context.session.addType) {
		return undefined
	}

	const existingMissions = userMissions.getAll(`tg${context.from!.id}`)
	return existingMissions
		.find(o => o.type === context.session.addType && o.url === context.session.addUrl)
}

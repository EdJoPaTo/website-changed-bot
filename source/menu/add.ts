import {Composer} from 'telegraf'
import {html as format} from 'telegram-format'
import {MenuTemplate, replyMenuToContext, Body} from 'telegraf-inline-menu/next-gen'
import TelegrafStatelessQuestion from 'telegraf-stateless-question'

import {backButtons} from './back-buttons'
import {Context} from './context'
import {TYPES, StringIsType} from '../hunter'
import {getAll} from '../user-missions'
import {generateUniqueKeyForUrl} from '../mission'

export const bot = new Composer<Context>()

export const menu = new MenuTemplate<Context>(menuBody)

const urlQuestion = new TelegrafStatelessQuestion<Context>('add-url', async context => {
	const url = context.message.text as string | undefined
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
		console.log('data', context.callbackQuery?.data)
		await Promise.all([
			urlQuestion.replyWithMarkdown(context, 'Please tell me the url you want to spy upon.'),
			context.deleteMessage().catch(() => {})
		])
	}
})

menu.select('type', TYPES, {
	isSet: (context, key) => context.session.addType === key,
	set: (context, key) => {
		if (key === undefined || StringIsType(key)) {
			context.session.addType = key
		}
	}
})

menu.interact('Reset', 'reset', {
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
	do: async context => context.answerCbQuery('TODO')
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

	if (similarUrlExists(context)) {
		text += '⚠️'
		text += 'You already have a similar url added! Use a different url :)'
		text += '\n'
	}

	return {text, parse_mode: format.parse_mode}
}

function similarUrlExists(context: Context): boolean {
	if (!context.session.addUrl || !context.session.addType) {
		return false
	}

	const uniqueIdentifier = generateUniqueKeyForUrl(context.session.addUrl)
	const existingMissions = getAll(`tg${context.from!.id}`)

	return existingMissions
		.filter(o => o.type === context.session.addType)
		.map(o => o.uniqueIdentifier)
		.some(o => o === uniqueIdentifier)
}

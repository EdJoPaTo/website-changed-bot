import {existsSync, readFileSync} from 'fs'

import {generateUpdateMiddleware} from 'telegraf-middleware-console-time'
import {InlineKeyboardMarkup, User} from 'telegraf/typings/telegram-types'
import Telegraf, {Extra, Markup, session} from 'telegraf'

import * as users from './lib/users'
import {bot as partAdmin} from './parts/admin'

import {bot as menu} from './menu'
import {checkRunner} from './run-missions'
import {Context} from './menu/context'
import {init as initTrophyStore} from './trophy-store'
import {notifyChange, notifyError, init as initNotifyTgUser} from './notify-tg-user'

const tokenFilePath = existsSync('/run/secrets') ? '/run/secrets/bot-token.txt' : 'bot-token.txt'
const token = readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf<Context>(token)

if (process.env.NODE_ENV !== 'production') {
	bot.use(generateUpdateMiddleware())
	bot.use(async (context, next) => {
		if (context.callbackQuery?.data) {
			console.log(new Date().toISOString(), context.callbackQuery.data)
		}

		return next()
	})
}

initNotifyTgUser(bot.telegram)
initTrophyStore()

bot.use(async (ctx, next) => {
	const userList = users.getUsers()
	if (userList.includes(ctx.from!.id)) {
		await next?.()
		return
	}

	if (userList.length === 0) {
		await users.addUser(ctx.from!.id, true)
		await ctx.reply('you are now Admin ☺️')
		return
	}

	await Promise.all([
		bot.telegram.forwardMessage(users.getAdmin(), ctx.chat!.id, ctx.message!.message_id),
		bot.telegram.sendMessage(users.getAdmin(), 'Wrong user```\n' + JSON.stringify(ctx.update, null, 2) + '\n```', Extra.markdown().markup(generateAddUserKeyboard(ctx.from!))),
		ctx.reply('Sorry. I do not serve you.\nThe admin was notified. Maybe he will grant you the permission.')
	])
})

bot.use(session())
bot.use(menu)

bot.use(users.middleware())

bot.use(Telegraf.optional(ctx => ctx.from!.id === users.getAdmin(), partAdmin.middleware()))

function generateAddUserKeyboard(userDetails: User): InlineKeyboardMarkup {
	return Markup.inlineKeyboard([
		Markup.callbackButton(`add ${userDetails.first_name} as allowed user`, `adduser:${userDetails.id}`)
	])
}

bot.catch((error: any) => {
	if (error instanceof Error && error.message.includes('query is too old')) {
		return
	}

	if (error instanceof Error && error.message.includes('message is not modified')) {
		return
	}

	console.error('TELEGRAF ERROR', error)
})

async function startup() {
	await bot.launch()
	console.log(new Date(), 'Bot started as', bot.options.username)

	await checkRunner(notifyChange, notifyError)
	console.log(new Date(), 'never reached')
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startup()

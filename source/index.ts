import {existsSync, readFileSync} from 'fs'

import {generateUpdateMiddleware} from 'telegraf-middleware-console-time'
import {InlineKeyboardMarkup, User} from 'typegram'
import {Telegraf, Composer, session} from 'telegraf'

import * as users from './lib/users.js'
import {bot as partAdmin} from './parts/admin.js'

import {bot as groupActivity} from './group-activity.js'
import {bot as menu} from './menu/index.js'
import {checkRunner} from './run-missions.js'
import {Context} from './context.js'
import {init as initTrophyStore} from './trophy-store/index.js'
import {notifyChange, notifyError, init as initNotifyTgUser} from './notify-tg-user.js'

process.title = 'website-changed-bot'

const token = (existsSync('/run/secrets/bot-token.txt') && readFileSync('/run/secrets/bot-token.txt', 'utf8').trim()) ||
	(existsSync('bot-token.txt') && readFileSync('bot-token.txt', 'utf8').trim()) ||
	// eslint-disable-next-line @typescript-eslint/dot-notation
	process.env['BOT_TOKEN']
if (!token) {
	throw new Error('You have to provide the bot-token from @BotFather via file (bot-token.txt) or environment variable (BOT_TOKEN)')
}

const bot = new Telegraf<Context>(token)

// eslint-disable-next-line @typescript-eslint/dot-notation
if (process.env['NODE_ENV'] !== 'production') {
	bot.use(generateUpdateMiddleware())
}

initNotifyTgUser(bot.telegram)
initTrophyStore()

bot.use(async (ctx, next) => {
	if (!ctx.from) {
		// Whatever this is, it is not relevant
		console.log('ignore not relevant telegram update', ctx.update)
		return
	}

	const userList = users.getUsers()
	if (userList.includes(ctx.from.id)) {
		await next()
		return
	}

	if (ctx.chat?.type !== 'private') {
		// Dont spam groups or channels
		return
	}

	if (userList.length === 0) {
		console.log('create initial admin', ctx.from)
		await users.addUser(ctx.from.id, true)
		await ctx.reply('you are now Admin ☺️')
		await next()
		return
	}

	if (ctx.message) {
		await ctx.forwardMessage(users.getAdmin(), {disable_notification: true})
	}

	await Promise.all([
		bot.telegram.sendMessage(users.getAdmin(), 'Wrong user```\n' + JSON.stringify(ctx.update, null, 2) + '\n```', {
			disable_notification: true,
			parse_mode: 'Markdown',
			reply_markup: generateAddUserKeyboard(ctx.from)
		}),
		ctx.reply('Sorry. I do not serve you.\nThe admin was notified. Maybe he will grant you the permission.')
	])
})

bot.use(session())
bot.use(async (ctx, next) => {
	ctx.session ??= {}
	return next()
})

bot.use(Composer.groupChat(groupActivity))

bot.use(menu)

bot.use(Telegraf.optional(ctx => ctx.from!.id === users.getAdmin(), partAdmin.middleware()))

function generateAddUserKeyboard(userDetails: User): InlineKeyboardMarkup {
	return {
		inline_keyboard: [[
			{text: `add ${userDetails.first_name} as allowed user`, callback_data: `adduser:${userDetails.id}`}
		]]
	}
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
	await bot.telegram.setMyCommands([
		{command: 'start', description: 'display the menu'},
		{command: 'list', description: 'show all watched urls'},
		{command: 'add', description: 'add another url'}
	])

	await bot.launch()
	console.log(new Date(), 'Bot started as', bot.botInfo?.username)

	await checkRunner(notifyChange, notifyError)
	console.log(new Date(), 'never reached')
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startup()

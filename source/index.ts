import {existsSync, readFileSync} from 'fs'

import {Bot, session} from 'grammy'
import {generateUpdateMiddleware} from 'telegraf-middleware-console-time'
import {InlineKeyboardButton, User} from '@grammyjs/types'

import * as users from './lib/users.js'
import {bot as partAdmin} from './parts/admin.js'

import {bot as groupActivity} from './group-activity.js'
import {bot as menu} from './menu/index.js'
import {checkRunner} from './run-missions.js'
import {Context} from './context.js'
import {init as initTrophyStore} from './trophy-store/index.js'
import {notifyChange, notifyError, init as initNotifyTgUser} from './notify-tg-user.js'

process.title = 'website-changed-bot'

const token = (existsSync('/run/secrets/bot-token.txt') && readFileSync('/run/secrets/bot-token.txt', 'utf8').trim())
	|| (existsSync('bot-token.txt') && readFileSync('bot-token.txt', 'utf8').trim())
	|| process.env['BOT_TOKEN']
if (!token) {
	throw new Error('You have to provide the bot-token from @BotFather via file (bot-token.txt) or environment variable (BOT_TOKEN)')
}

const bot = new Bot<Context>(token)

if (process.env['NODE_ENV'] !== 'production') {
	bot.use(generateUpdateMiddleware())
}

initNotifyTgUser(bot.api)
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
		bot.api.sendMessage(users.getAdmin(), 'Wrong user```\n' + JSON.stringify(ctx.update, null, 2) + '\n```', {
			disable_notification: true,
			parse_mode: 'Markdown',
			reply_markup: {inline_keyboard: generateAddUserKeyboard(ctx.from)},
		}),
		ctx.reply(`Sorry. I do not serve you (yet).
The admin was notified and might grant you the permission.

If you are familiar with GitHub Actions or hosting stuff yourself check out my [website-stalker](https://github.com/EdJoPaTo/website-stalker).
This bot will migrate towards using this tool under the hood too. (As soon as I find some time to do it…)`, {
			parse_mode: 'Markdown',
		}),
	])
})

bot.use(session({
	initial: () => ({}),
}))

// eslint-disable-next-line unicorn/no-array-method-this-argument
bot.filter(ctx => ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup', groupActivity)

bot.use(menu)

// eslint-disable-next-line unicorn/no-array-method-this-argument
bot.filter(ctx => ctx.from?.id === users.getAdmin(), partAdmin)

function generateAddUserKeyboard(userDetails: User): InlineKeyboardButton[][] {
	return [[
		{text: `add ${userDetails.first_name} as allowed user`, callback_data: `adduser:${userDetails.id}`},
	]]
}

bot.catch((error: any) => {
	if (error instanceof Error && error.message.includes('query is too old')) {
		return
	}

	if (error instanceof Error && error.message.includes('message is not modified')) {
		return
	}

	console.error('GRAMMY ERROR', error)
})

async function startup() {
	await bot.api.setMyCommands([
		{command: 'start', description: 'display the menu'},
		{command: 'list', description: 'show all watched urls'},
		{command: 'add', description: 'add another url'},
	])

	void bot.start({
		onStart: botInfo => {
			console.log(new Date(), 'Bot starts as', botInfo.username)
		},
	})

	await checkRunner(notifyChange, notifyError)
	console.log(new Date(), 'never reached')
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startup()

import {existsSync, readFileSync} from 'fs'

import {InlineKeyboardMarkup, User} from 'telegraf/typings/telegram-types'
import {markdown as format} from 'telegram-format'
import Telegraf, {Extra, Markup} from 'telegraf'

import * as users from './lib/users'
import * as website from './lib/website'

import {bot as partAdd} from './parts/add'
import {bot as partAdmin} from './parts/admin'
import {bot as partList} from './parts/list'

const CHECK_INTERVAL_IN_MINUTES = 30 // Every 30 minutes

let lastCheck = 0

const tokenFilePath = existsSync('/run/secrets') ? '/run/secrets/bot-token.txt' : 'bot-token.txt'
const token = readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf(token)

bot.use(async (ctx, next) => {
	const userList = users.getUsers()
	if (userList.includes(ctx.from!.id)) {
		await next?.()
		return
	}

	if (userList.length === 0) {
		await users.addUser(ctx.from!.id)
		await ctx.reply('you are now Admin ☺️')
		return
	}

	await Promise.all([
		bot.telegram.forwardMessage(users.getAdmin(), ctx.chat!.id, ctx.message!.message_id),
		bot.telegram.sendMessage(users.getAdmin(), 'Wrong user```\n' + JSON.stringify(ctx.update, null, 2) + '\n```', Extra.markdown().markup(generateAddUserKeyboard(ctx.from!))),
		ctx.reply('Sorry. I do not serve you.\nThe admin was notified. Maybe he will grant you the permission.')
	])
})

bot.use(users.middleware())

bot.use(Telegraf.optional(ctx => ctx.from!.id === users.getAdmin(), partAdmin.middleware()))
bot.use(partList.middleware())
bot.use(partAdd.middleware())

function generateAddUserKeyboard(userDetails: User): InlineKeyboardMarkup {
	return Markup.inlineKeyboard([
		Markup.callbackButton(`add ${userDetails.first_name} as allowed user`, `adduser:${userDetails.id}`)
	])
}

bot.command(['start', 'help'], ctx => {
	let text = `Websites you add will get checked every ${CHECK_INTERVAL_IN_MINUTES} minutes. Find out the last check with /lastcheck\n\n`

	text += 'Add websites by sending me it in the following syntax: `name: url`. Example: `EdJoPaTos Blog: https://edjopato.de/blog`\n\n'

	text += 'Use /list to get the list of your currently checked websites\n'

	ctx.replyWithMarkdown(text)
})

bot.command('lastcheck', async ctx => {
	const msAgo = Date.now() - lastCheck
	const secondsAgo = (msAgo / 1000) % 60
	const minutesAgo = Math.floor(msAgo / 60 / 1000)

	await ctx.reply(`${minutesAgo}:${secondsAgo} ago`)
})

setInterval(doCheck, CHECK_INTERVAL_IN_MINUTES * 60 * 1000)
doCheck()

async function doCheck() {
	await Promise.all(users.getUsers().map(async user => doCheckUser(user)))
	lastCheck = Date.now()
}

async function doCheckUser(user: number): Promise<void> {
	const {websites} = users.getUserSettings(user)
	const names = Object.keys(websites)
	await Promise.all(names.map(async name =>
		checkSpecific(user, name, websites[name])
	))
}

async function checkSpecific(user: number, name: string, uri: string): Promise<void> {
	try {
		const result = await website.hasChanged(`${user}-${name}`, uri)
		// Debug
		// console.log(user, name, uri, result)

		if (result === true) {
			await bot.telegram.sendMessage(user, `${format.url(name, uri)} has changed!`, Extra.markdown() as any)
			return
		}

		if (result === false) {
			// Unchanged
			return
		}

		await bot.telegram.sendMessage(user, `${format.url(name, uri)} was initialized. Now it can be checked for differences with the next check.`, Extra.markdown() as any)
	} catch (error) {
		console.error('Error happened in checkSpecific', user, name, uri, error)
		await bot.telegram.sendMessage(user, `${format.url(name, uri)} seems down\n${error instanceof Error ? error.message : String(error)}`, Extra.markdown() as any)
	}
}

bot.catch((error: any) => {
	if (error.description === 'Bad Request: message is not modified') {
		return
	}

	console.error(error)
})

async function startup() {
	await bot.launch()
	console.log(new Date(), 'Bot started as', bot.options.username)
}

startup()

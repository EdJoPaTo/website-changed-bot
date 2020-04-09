/* eslint @typescript-eslint/no-dynamic-delete: warn */

import {Composer, Markup, Extra, ContextMessageUpdate} from 'telegraf'
import {InlineKeyboardMarkup, ExtraEditMessage} from 'telegraf/typings/telegram-types'

import {User} from '../lib/users'

export const bot = new Composer()

const removeKeyboardStart = Markup.inlineKeyboard([
	Markup.callbackButton('remove something from the list', 'remove-start')
])
const removeKeyboardFinishButton = Markup.callbackButton('✅ finish', 'remove-finish')

function generateRemoveKeyboard(ctx: ContextMessageUpdate): InlineKeyboardMarkup {
	const user = (ctx as any).session as User
	const {websites} = user
	const buttons = Object.keys(websites)
		.sort((a, b) => a.localeCompare(b))
		.map(name => [Markup.callbackButton(`🗑 ${name}`, `remove:${name}`)])

	buttons.push([removeKeyboardFinishButton])
	return Markup.inlineKeyboard(buttons)
}

function generateList(ctx: ContextMessageUpdate, keyboardMarkup?: InlineKeyboardMarkup): {text: string; extra?: ExtraEditMessage} {
	const user = (ctx as any).session as User
	const {websites} = user

	if (Object.keys(websites).length === 0) {
		return {text: 'There are no websites on your list.'}
	}

	const list = Object.keys(websites)
		.sort((a, b) => a.localeCompare(b))
		.map(name => `${name}\n${websites[name]}`)
		.join('\n')
	const text = `Your checked websites:\n\n${list}`

	if (!keyboardMarkup) {
		keyboardMarkup = generateRemoveKeyboard(ctx)
	}

	const extra = Extra
		.webPreview(false)
		.markup(keyboardMarkup)

	return {text, extra}
}

bot.command('list', async ctx => {
	const {text, extra} = generateList(ctx, removeKeyboardStart)
	await ctx.reply(text, extra)
})

bot.action('remove-start', async ctx => ctx.editMessageReplyMarkup(generateRemoveKeyboard(ctx)))
bot.action('remove-finish', async ctx => ctx.editMessageReplyMarkup(removeKeyboardStart))
bot.action(/^remove:(.+)$/, async ctx => {
	const user = (ctx as any).session as User
	const {websites} = user
	const name = ctx.match![1]
	delete websites[name]
	const {text, extra} = generateList(ctx)
	await Promise.all([
		ctx.editMessageText(text, extra),
		ctx.answerCbQuery(`${name} removed`)
	])
})

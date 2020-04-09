import {markdown as format} from 'telegram-format'
import {Composer, Extra, ContextMessageUpdate} from 'telegraf'

import {User} from '../lib/users'
import * as website from '../lib/website'

export const bot = new Composer()

bot.on('text', Composer.optional(
	ctx => Boolean(ctx.message?.entities?.some(o => o.type === 'text_link')),
	async ctx => {
		const {text, entities} = ctx.message!

		const toBeAdded = entities!
			.filter(o => o.type === 'text_link')
			.map(o => ({
				name: text!.slice(o.offset, o.offset + o.length),
				uri: o.url!
			}))

		await Promise.all(
			toBeAdded.map(async o => add(ctx, o.name, o.uri))
		)
	}
))

bot.hears(/([^:]+):(.+)/, async ctx => {
	const name = ctx.match![1].trim()
	const uri = ctx.match![2].trim()
	return add(ctx, name, uri)
})

async function add(ctx: ContextMessageUpdate, name: string, originalURI: string): Promise<void> {
	const user = (ctx as any).session as User
	const {websites} = user

	let uri = originalURI
	const extra = Extra
		.inReplyTo(ctx.message!.message_id)
		.markdown()

	if (!uri.startsWith('http')) {
		uri = `https://${uri}`
	}

	if (uri !== originalURI) {
		ctx.reply(`WARNING: Assume\n${uri}\ninstead of\n${originalURI}`, extra as any)
	}

	if (websites[name]) {
		const oldURI = websites[name]
		if (uri === oldURI) {
			await ctx.reply('This website is already on your /list', extra as any)
			return
		}

		// TODO: replace button
		await ctx.reply(`There is already an entry on your /list with that name but the URI differs:\nCurrent URI: ${oldURI}\nYou tried to add: ${uri}`, extra as any)
		return
	}

	try {
		// Check URI
		await website.hasChanged(`${ctx.from!.id}-${name}`, uri)
		websites[name] = uri
		await ctx.reply(`${format.url(name, uri)} was added to your /list`, extra as any)
	} catch (error) {
		await ctx.reply(`${format.url(name, uri)} seems down\n${error instanceof Error ? error.message : String(error)}`, extra as any)
	}
}

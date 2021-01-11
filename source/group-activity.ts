import {Composer} from 'telegraf'

import {isAuthorized} from './lib/users'

const removeMeFromBeingAdminMessageText = `Telegram bots which are administrators are a privacy risk to your group as they see every message or might do things every other group admin could do.

As admin bots see every message they require more resources to run which is a useless waste of energy.
Please change me to be a normal user. 😘`

export const bot = new Composer()

bot.use(async (context, next) => {
	let anyValidAdminExists = false

	try {
		const botId = context.botInfo.id
		const chatAdmins = await context.getChatAdministrators()

		if (context.chat!.type === 'supergroup' && chatAdmins.some(o => o.user.id === botId)) {
			console.log('bot is admin. Be annoyed.', context.chat)
			await context.reply(removeMeFromBeingAdminMessageText)
		}

		anyValidAdminExists = chatAdmins.some(o => isAuthorized(o.user.id))
	} catch {}

	if (!anyValidAdminExists) {
		try {
			await context.reply('No admin in this group seems to be authorized to use this bot…')
		} catch {}

		await context.leaveChat()
		return
	}

	await next()
})

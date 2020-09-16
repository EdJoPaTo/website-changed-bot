import {Composer} from 'telegraf'
import arrayFilterUnique from 'array-filter-unique'

import {getUserSettings, setUserSettings} from './lib/users'

export const bot = new Composer()

bot.use(async context => {
	let anyValidAdminExists = false

	try {
		const chatAdmins = await context.getChatAdministrators()
		// TODO: be annoyed when the bot itself is an admin (look at the LockBot for hints)
		for (const admin of chatAdmins) {
			const settings = getUserSettings(admin.user.id)
			if (!settings) {
				continue
			}

			anyValidAdminExists = true

			settings.groups = [...settings.groups, context.chat!.id]
				.filter(arrayFilterUnique())
			// eslint-disable-next-line no-await-in-loop
			await setUserSettings(admin.user.id, settings)
		}
	} catch { }

	if (!anyValidAdminExists) {
		try {
			await context.reply('No admin in this group seems to be authorized to use this bot…')
		} catch {}

		await context.leaveChat()
	}
})

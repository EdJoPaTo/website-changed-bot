import {Composer} from 'grammy'

import * as users from '../lib/users.js'

export const bot = new Composer()

bot.callbackQuery(/adduser:(\d+)/, async ctx => {
	const userID = Number(ctx.match![1])
	await users.addUser(userID, false)
	await ctx.api.sendMessage(userID, 'You can now use this bot!\nUse /start to get started.')
	return ctx.answerCallbackQuery({text: 'User added'})
})

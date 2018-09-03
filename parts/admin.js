const Telegraf = require('telegraf')

const users = require('../lib/users.js')

const bot = new Telegraf.Composer()
module.exports = bot

bot.action(/adduser:(\d+)/, async ctx => {
  const userID = ctx.match[1]
  await users.addUser(userID)
  await bot.telegram.sendMessage(userID, 'You can now use this bot!\nUse /help for more info how to use it.')
  return ctx.answerCbQuery('User added')
})

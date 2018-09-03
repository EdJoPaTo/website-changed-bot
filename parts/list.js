const Telegraf = require('telegraf')

const {Markup, Extra} = Telegraf

const bot = new Telegraf.Composer()
module.exports = bot

const removeKeyboardStart = Markup.inlineKeyboard([
  Markup.callbackButton('remove something from the list', 'remove-start')
])
const removeKeyboardFinishButton = Markup.callbackButton('✅ finish', 'remove-finish')

function generateRemoveKeyboard(ctx) {
  const websites = ctx.session && ctx.session.websites
  const websiteNames = Object.keys(websites)
  const buttons = websiteNames.map(name => [Markup.callbackButton(`🗑 ${name}`, `remove:${name}`)])

  buttons.push([removeKeyboardFinishButton])
  return Markup.inlineKeyboard(buttons)
}

function generateList(ctx, keyboardMarkup) {
  if (!ctx.session.websites || Object.keys(ctx.session.websites).length === 0) {
    return {text: 'There are no websites on your list.'}
  }

  const list = Object.keys(ctx.session.websites)
    .map(name => `${name}\n${ctx.session.websites[name]}`)
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

bot.command('list', ctx => {
  const {text, extra} = generateList(ctx, removeKeyboardStart)
  return ctx.reply(text, extra)
})

bot.action('remove-start', ctx => ctx.editMessageReplyMarkup(generateRemoveKeyboard(ctx)))
bot.action('remove-finish', ctx => ctx.editMessageReplyMarkup(removeKeyboardStart))
bot.action(/remove:(\S+)/, ctx => {
  const name = ctx.match[1]
  delete ctx.session.websites[name]
  const {text, extra} = generateList(ctx)
  return Promise.all([
    ctx.editMessageText(text, extra),
    ctx.answerCbQuery(`${name} removed`)
  ])
})

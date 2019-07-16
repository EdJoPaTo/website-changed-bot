const Telegraf = require('telegraf')

const markdownHelper = require('../lib/markdown-helper.js')
const website = require('../lib/website.js')

const {Extra} = Telegraf

const bot = new Telegraf.Composer()
module.exports = bot

bot.hears(/([^:]+):(.+)/, async ctx => {
  if (!ctx.session.websites) {
    ctx.session.websites = {}
  }

  const name = ctx.match[1].trim()
  const originalURI = ctx.match[2].trim()
  let uri = originalURI
  const extra = Extra
    .inReplyTo(ctx.message.message_id)
    .markdown()

  if (!uri.startsWith('http')) {
    uri = `https://${uri}`
  }

  if (uri !== originalURI) {
    ctx.reply(`WARNING: Assume\n${uri}\ninstead of\n${originalURI}`, extra)
  }

  if (ctx.session.websites[name]) {
    const oldURI = ctx.session.websites[name]
    if (uri === oldURI) {
      return ctx.reply('This website is already on your /list', extra)
    }

    // TODO: replace button
    return ctx.reply(`There is already an entry on your /list with that name but the URI differs:\nCurrent URI: ${oldURI}\nYou tried to add: ${uri}`, extra)
  }

  try {
    // Check URI
    await website.hasChanged(`${ctx.from.id}-${name}`, uri)
    ctx.session.websites[name] = uri
    return ctx.reply(`${markdownHelper.uri(name, uri)} was added to your /list`, extra)
  } catch (error) {
    return ctx.reply(`${markdownHelper.uri(name, uri)} seems down\n${error.message}`, extra)
  }
})

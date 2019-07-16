const Telegraf = require('telegraf')

const markdownHelper = require('../lib/markdown-helper.js')
const website = require('../lib/website.js')

const {Extra} = Telegraf

const bot = new Telegraf.Composer()
module.exports = bot

bot.on('text', Telegraf.optional(
  ctx => ctx.message && ctx.message.entities && ctx.message.entities.some(o => o.type === 'text_link'),
  async ctx => {
    const {text, entities} = ctx.message

    const toBeAdded = entities
      .filter(o => o.type === 'text_link')
      .map(o => ({
        name: text.slice(o.offset, o.offset + o.length),
        uri: o.url
      }))

    await Promise.all(
      toBeAdded.map(o => add(ctx, o.name, o.uri))
    )
  }
))

bot.hears(/([^:]+):(.+)/, async ctx => {
  const name = ctx.match[1].trim()
  const uri = ctx.match[2].trim()
  return add(ctx, name, uri)
})

async function add(ctx, name, originalURI) {
  if (!ctx.session.websites) {
    ctx.session.websites = {}
  }

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
}

const fs = require('fs')
const Telegraf = require('telegraf')

const markdownHelper = require('./lib/markdown-helper.js')
const users = require('./lib/users.js')
const website = require('./lib/website.js')

const partAdd = require('./parts/add.js')
const partAdmin = require('./parts/admin.js')
const partList = require('./parts/list.js')

const {Extra, Markup} = Telegraf

const CHECK_INTERVAL_IN_MINUTES = 30 // Every 30 minutes
const WEBSITES_FOLDER = './websites/'

if (!fs.existsSync(WEBSITES_FOLDER)) {
  fs.mkdirSync(WEBSITES_FOLDER)
}

let lastCheck = 0

const tokenFilePath = process.env.NODE_ENV === 'production' ? process.env.npm_package_config_tokenpath : process.env.npm_package_config_tokenpathdebug
const token = fs.readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf(token)

bot.use(async (ctx, next) => {
  const userList = users.getUsers()
  if (userList.indexOf(ctx.from.id) >= 0) {
    return next()
  }

  if (userList.length === 0) {
    await users.addUser(ctx.from.id)
    return ctx.reply('you are now Admin ☺️')
  }

  return Promise.all([
    bot.telegram.forwardMessage(users.getAdmin(), ctx.chat.id, ctx.message.message_id),
    bot.telegram.sendMessage(users.getAdmin(), 'Wrong user```\n' + JSON.stringify(ctx.update, null, 2) + '\n```', Extra.markdown().markup(generateAddUserKeyboard(ctx.from))),
    ctx.reply('Sorry. I do not serve you.\nThe admin was notified. Maybe he will grant you the permission.')
  ])
})

bot.use(users.middleware())

bot.use(Telegraf.optional(ctx => ctx.from.id === users.getAdmin(), partAdmin))
bot.use(partList)
bot.use(partAdd)

function generateAddUserKeyboard(userDetails) {
  return Markup.inlineKeyboard([
    Markup.callbackButton(`add ${userDetails.first_name} as allowed user`, `adduser:${userDetails.id}`)
  ])
}

bot.command('help', ctx => {
  let text = `Websites you add will get checked every ${CHECK_INTERVAL_IN_MINUTES} minutes. Find out the last check with /lastcheck\n\n`

  text += 'Add websites by sending me it in the following syntax: `name: url`. Example: `EdJoPaTos Blog: https://edjopato.de/blog`\n\n'

  text += 'Use /list to get the list of your currently checked websites\n'

  ctx.reply(text, Extra.markdown())
})

bot.command('lastcheck', ctx => {
  const msAgo = Date.now() - lastCheck
  const secondsAgo = (msAgo / 1000) % 60
  const minutesAgo = Math.floor(msAgo / 60 / 1000)

  return ctx.reply(`${minutesAgo}:${secondsAgo} ago`)
})

setInterval(doCheck, CHECK_INTERVAL_IN_MINUTES * 60 * 1000)
doCheck()

async function doCheck() {
  await Promise.all(users.getUsers().map(user => doCheckUser(user)))
  lastCheck = Date.now()
}

async function doCheckUser(user) {
  const {websites} = await users.getUserSettings(user)
  if (!websites) {
    return
  }

  const names = Object.keys(websites)
  await Promise.all(names.map(name =>
    checkSpecific(user, name, websites[name])
  ))
}

async function checkSpecific(user, name, uri) {
  try {
    const result = await website.hasChanged(`${user}-${name}`, uri)
    // Debug
    // console.log(user, name, uri, result)

    if (result === true) {
      return bot.telegram.sendMessage(user, `${markdownHelper.uri(name, uri)} has changed!`, Extra.markdown())
    }

    if (result === false) {
      // Unchanged
      return
    }

    return bot.telegram.sendMessage(user, `${markdownHelper.uri(name, uri)} was initialized. Now it can be checked for differences with the next check.`, Extra.markdown())
  } catch (error) {
    return bot.telegram.sendMessage(user, `${markdownHelper.uri(name, uri)} seems down\n${error.message}`, Extra.markdown())
  }
}

bot.catch(error => {
  if (error.description === 'Bad Request: message is not modified') {
    return
  }

  console.error(error)
})

bot.startPolling()

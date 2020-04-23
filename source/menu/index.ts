import {Composer} from 'telegraf'
import {MenuMiddleware} from 'telegraf-inline-menu/next-gen'
import {generateUpdateMiddleware} from 'telegraf-middleware-console-time'

import {Context} from './context'
import {mainMenu} from './main-menu'

import {bot as addComposer} from './add'

export const bot = new Composer<Context>()
bot.use(generateUpdateMiddleware())
bot.use(addComposer)

const menuMiddleware = new MenuMiddleware('/', mainMenu)

bot.command('start', async ctx => menuMiddleware.replyToContext(ctx))

bot.use(menuMiddleware.middleware())

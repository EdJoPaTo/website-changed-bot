import {Composer} from 'telegraf'
import {MenuMiddleware} from 'telegraf-inline-menu/dist/next-gen'

import {Context} from './context'
import {mainMenu} from './main-menu'

import {bot as addComposer} from './add'

export const bot = new Composer<Context>()
bot.use(addComposer)

const menuMiddleware = new MenuMiddleware('/', mainMenu)

bot.command('start', async ctx => menuMiddleware.replyToContext(ctx))

bot.use(menuMiddleware.middleware())

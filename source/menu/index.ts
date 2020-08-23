import {Composer} from 'telegraf'
import {MenuMiddleware} from 'telegraf-inline-menu'

import {Context} from '../context'

import {mainMenu} from './main-menu'

import {bot as addComposer} from './add'
import {bot as addContentReplacerComposer} from './details/add-content-replacer'

export const bot = new Composer<Context>()
bot.use(addComposer)
bot.use(addContentReplacerComposer)

const menuMiddleware = new MenuMiddleware('/', mainMenu)

bot.command('start', async ctx => menuMiddleware.replyToContext(ctx))
bot.command('add', async ctx => menuMiddleware.replyToContext(ctx, '/add/'))

bot.use(menuMiddleware.middleware())

import {Composer} from 'telegraf'
import {MenuMiddleware} from 'telegraf-inline-menu'
import {MessageEntity} from 'typegram'

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
bot.command('list', async ctx => menuMiddleware.replyToContext(ctx, '/list/'))

bot.on('message', async (ctx, next) => {
	if (!ctx.message) {
		throw new Error('typings?!')
	}

	const text = ('text' in ctx.message && ctx.message.text) ||
		('caption' in ctx.message && ctx.message.caption) ||
		''
	const entities = ('entities' in ctx.message && ctx.message.entities) ||
		('caption_entities' in ctx.message && ctx.message.caption_entities) ||
		[]

	const url = getFirstUrlFromMessageEntities(text, entities)

	if (url) {
		ctx.session.addUrl = url
		await menuMiddleware.replyToContext(ctx, '/add/')
	} else {
		await next()
	}
})

bot.use(menuMiddleware.middleware())

function getFirstUrlFromMessageEntities(text: string, entities: readonly MessageEntity[]): string | undefined {
	for (const entity of entities) {
		if (entity.type === 'text_link') {
			return entity.url
		}

		if (entity.type === 'url') {
			return text.slice(entity.offset, entity.offset + entity.length)
		}
	}

	return undefined
}

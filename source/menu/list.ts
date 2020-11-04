import {MenuTemplate} from 'telegraf-inline-menu'

import {Context} from '../context'
import {generateFilename} from '../hunter'
import {userMissions} from '../user-missions'

import {backButtons} from './lib/generics'

import {menu as detailsMenu} from './details'

export const menu = new MenuTemplate<Context>('Here you can see all the missions you set up to check regularly.')

const ENTRIES_PER_PAGE = 10

menu.chooseIntoSubmenu('', ctx => getAllEntries(ctx.chat!.id), detailsMenu, {
	columns: 1,
	maxRows: ENTRIES_PER_PAGE,
	getCurrentPage: context => context.session.page,
	setPage: (context, page) => {
		context.session.page = page
	}
})

menu.manualRow(backButtons)

function getAllEntries(chatId: number): Map<string, string> {
	const issuer = `tg${chatId}`
	const all = userMissions.get(issuer) ?? []
	const entries = new Map<string, string>()
	all
		.map((o, i) => ({
			index: i,
			type: o.type,
			url: o.url
		}))
		.sort((a, b) => generateFilename(a.url, a.type).localeCompare(generateFilename(b.url, b.type)))
		.forEach(o => {
			const filename = generateFilename(o.url, o.type)
			const key = `i${o.index}-${filename.slice(0, 20)}`
			entries.set(key, filename)
		})
	return entries
}

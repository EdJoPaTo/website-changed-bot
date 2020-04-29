import {MenuTemplate} from 'telegraf-inline-menu'

import {generateFilename} from '../hunter'
import {userMissions} from '../user-missions'

import {backButtons} from './back-buttons'
import {Context} from './context'
import {menu as detailsMenu} from './details'

const SHOW_URL_LENGTH = 50

export const menu = new MenuTemplate<Context>('Here you can see all the missions you set up to check regularly.')

menu.chooseIntoSubmenu('', ctx => getAllEntries(ctx.from!.id), detailsMenu, {
	columns: 1,
	getCurrentPage: context => context.session.page,
	setPage: (context, page) => {
		context.session.page = page
	}
})

menu.manualRow(backButtons)

function getAllEntries(user: number): Map<string, string> {
	const all = userMissions.get(`tg${user}`) ?? []
	const entries = new Map<string, string>()
	all
		.map((o, i) => ({
			index: i,
			type: o.type,
			url: o.url
		}))
		.sort((a, b) => generateFilename(a.url, a.type).localeCompare(generateFilename(b.url, b.type)))
		.forEach(o => {
			let title = ''
			title += o.type
			title += ' '
			title += o.url.slice(0, SHOW_URL_LENGTH)

			if (o.url.length > SHOW_URL_LENGTH) {
				title += '…'
			}

			const key = `i${o.index}-${generateFilename(o.url, o.type).slice(0, 25)}`
			entries.set(key, title)
		})
	return entries
}

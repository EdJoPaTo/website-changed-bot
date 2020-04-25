import {MenuTemplate} from 'telegraf-inline-menu/dist/next-gen'

import {generateUniqueKeyForUrl} from '../mission'
import {userMissions} from '../user-missions'

import {backButtons} from './back-buttons'
import {Context} from './context'
import {menu as detailsMenu} from './details'

const SHOW_URL_LENGTH = 50

export const menu = new MenuTemplate<Context>({
	text: 'Hier kannst du all deine Aufträge sehen, die regelmäßig abgearbeitet werden.'
})

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
			key: `i${i}`,
			type: o.type,
			url: o.url
		}))
		.sort((a, b) => a.type.localeCompare(b.type))
		.sort((a, b) => generateUniqueKeyForUrl(a.url).localeCompare(generateUniqueKeyForUrl(b.url)))
		.forEach(o => {
			let title = ''
			title += o.type
			title += ' '
			title += o.url.slice(0, SHOW_URL_LENGTH)

			if (o.url.length > SHOW_URL_LENGTH) {
				title += '…'
			}

			entries.set(o.key, title)
		})
	return entries
}

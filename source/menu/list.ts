import {MenuTemplate} from 'telegraf-inline-menu/dist/next-gen'

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
	all.forEach((o, i) => {
		let title = ''
		title += o.type
		title += ' '
		title += o.url.slice(0, SHOW_URL_LENGTH)

		if (o.url.length > SHOW_URL_LENGTH) {
			title += '…'
		}

		entries.set(String(i), title)
	})

	return entries
}

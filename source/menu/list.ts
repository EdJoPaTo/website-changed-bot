import {html as format} from 'telegram-format'
import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {generateFilename} from '../hunter'
import {userMissions} from '../user-missions'

import {backButtons} from './back-buttons'
import {Context} from './context'
import {menu as detailsMenu} from './details'

export const menu = new MenuTemplate<Context>(menuBody)

menu.chooseIntoSubmenu('', ctx => getAllEntries(ctx.from!.id), detailsMenu, {
	columns: 1,
	getCurrentPage: context => context.session.page,
	setPage: (context, page) => {
		context.session.page = page
	}
})

menu.manualRow(backButtons)

function menuBody(context: Context): Body {
	let text = ''

	text += 'Here you can see all the missions you set up to check regularly.'
	text += '\n\n'

	const all = userMissions.get(`tg${context.from!.id}`) ?? []
	const missions = all
		.sort((a, b) => generateFilename(a.url, a.type).localeCompare(generateFilename(b.url, b.type)))

	for (const mission of missions) {
		const label = format.monospace(mission.type) + ': ' + format.escape(mission.url)
		text += format.url(label, mission.url)
		text += '\n'
	}

	return {text, parse_mode: format.parse_mode}
}

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
			title += o.url

			const key = `i${o.index}-${generateFilename(o.url, o.type).slice(0, 25)}`
			entries.set(key, title)
		})
	return entries
}

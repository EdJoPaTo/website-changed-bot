import {html as format} from 'telegram-format'
import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {Context} from '../context'
import {generateFilename} from '../hunter'
import {userMissions} from '../user-missions'

import {backButtons} from './lib/generics'

import {menu as detailsMenu} from './details'

export const menu = new MenuTemplate<Context>(menuBody)

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

function menuBody(context: Context): Body {
	let text = ''

	text += 'Here you can see all the missions you set up to check regularly.'
	text += '\n\n'

	const page = (context.session.page ?? 1) - 1
	const offset = page * ENTRIES_PER_PAGE
	const end = (page + 1) * ENTRIES_PER_PAGE

	const issuer = `tg${context.chat!.id}`
	const all = userMissions.get(issuer) ?? []
	const missions = all
		.sort((a, b) => generateFilename(a.url, a.type).localeCompare(generateFilename(b.url, b.type)))
		.slice(offset, end)

	for (const mission of missions) {
		const label = format.monospace(mission.type) + ': ' + format.escape(mission.url)
		text += format.url(label, mission.url)
		text += '\n'
	}

	return {
		text,
		disable_web_page_preview: true,
		parse_mode: format.parse_mode
	}
}

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

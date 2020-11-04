import {MenuTemplate} from 'telegraf-inline-menu'
import arrayFilterUnique from 'array-filter-unique'

import {Context} from '../context'
import {generateFilename} from '../hunter'
import {userMissions} from '../user-missions'

import {backButtons} from './lib/generics'

import {menu as detailsMenu} from './details'

export const menu = new MenuTemplate<Context>('Here you can see all the missions you set up to check regularly.')

const ENTRIES_PER_PAGE = 10

menu.select('toplevel', topLevelOptions, {
	columns: 4,
	isSet: (context, key) => context.session.listTopLevel === key,
	set: (context, key) => {
		context.session.listTopLevel = key
		return true
	}
})

menu.chooseIntoSubmenu('', detailsOptions, detailsMenu, {
	columns: 1,
	maxRows: ENTRIES_PER_PAGE,
	getCurrentPage: context => context.session.page,
	setPage: (context, page) => {
		context.session.page = page
	}
})

menu.manualRow(backButtons)

function topLevelOptions(context: Context): string[] {
	const issuer = `tg${context.chat!.id}`
	const all = userMissions.get(issuer) ?? []
	return all
		.map(o => generateFilename(o.url, o.type))
		.map(o => o.split('-')[0])
		.filter(arrayFilterUnique())
		.sort((a, b) => a.localeCompare(b))
}

function detailsOptions(context: Context): Map<string, string> {
	const {listTopLevel} = context.session
	const topLevelFilter = listTopLevel ?
		(o: string) => o.startsWith(listTopLevel + '-') :
		() => true

	return getAllEntries(context.chat!.id, topLevelFilter)
}

function getAllEntries(chatId: number, filenameFilter: (s: string) => boolean): Map<string, string> {
	const issuer = `tg${chatId}`
	const all = userMissions.get(issuer) ?? []
	const entries = new Map<string, string>()
	all
		.map((o, i) => ({
			index: i,
			filename: generateFilename(o.url, o.type)
		}))
		.filter(o => filenameFilter(o.filename))
		.sort((a, b) => a.filename.localeCompare(b.filename))
		.forEach(o => {
			const key = `i${o.index}-${o.filename.slice(0, 20)}`
			entries.set(key, o.filename)
		})
	return entries
}

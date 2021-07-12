import {html as format} from 'telegram-format'
import {Telegram} from 'telegraf'

import {Mission} from './hunter/index.js'

let telegram: Telegram

export function init(tg: Telegram): void {
	telegram = tg
}

export async function notifyChange(issuer: string, mission: Mission, change: boolean | undefined): Promise<void> {
	if (change === false) {
		return
	}

	const user = issuer.slice(2)
	let text = ''
	text += mission.type + ' changed on'
	text += '\n'
	text += mission.url

	await telegram.sendMessage(user, text, {
		reply_markup: {
			remove_keyboard: true,
		},
	})
}

export async function notifyError(issuer: string, mission: Mission, error: any): Promise<void> {
	console.error('MISSION ERROR', issuer, mission, error)

	const user = issuer.slice(2)
	let text = ''

	text += 'Something went wrong'
	text += '\n'
	text += mission.type
	text += '\n'
	text += mission.url
	text += '\n'

	if (error instanceof Error) {
		text += format.escape(error.name)
		text += ': '
		text += format.escape(error.message)
		text += '\n'
	} else {
		text += String(error)
		text += '\n'
	}

	await telegram.sendMessage(user, text, {
		parse_mode: format.parse_mode,
		reply_markup: {
			remove_keyboard: true,
		},
	})
}

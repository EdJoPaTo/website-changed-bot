import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {html as format} from 'telegram-format'

import {Context} from '../context.js'
import * as gitDaemon from '../trophy-store/git-daemon.js'

import {backButtons} from './lib/generics.js'

export const menu = new MenuTemplate<Context>(menuBody)

function enableText(context: Context): string {
	const {secret} = getInfo(context)
	return secret ? 'New Link' : 'Enable Git'
}

menu.interact(enableText, 'enable', {
	do: async context => {
		const issuer = `tg${context.chat!.id}`
		const secret = generateSecret()
		gitDaemon.createLink(issuer, secret)
		return '.'
	}
})

menu.interact('Disable Git', 'disable', {
	hide: context => {
		const {secret} = getInfo(context)
		return !secret
	},
	do: async context => {
		const issuer = `tg${context.chat!.id}`
		gitDaemon.removeLink(issuer)
		return '.'
	}
})

menu.manualRow(backButtons)

function getInfo(context: Context): {issuer: string; secret: string | undefined} {
	const issuer = `tg${context.chat!.id}`
	const secret = gitDaemon.getCurrentSecret(issuer)
	return {issuer, secret}
}

function menuBody(context: Context): Body {
	const {issuer, secret} = getInfo(context)

	let text = ''
	text += 'You can take a look on what exactly changed via git history. Each time a change is detected a git commit is also created. In order to view the changes you can git clone your personal repo.'
	text += '\n\n'

	if (secret) {
		const remote = gitDaemon.generateRemote(issuer, secret)

		text += 'This is your personal remote:\n'
		text += format.monospace(remote)
		text += '\n\n'
		text += 'You can use it like you would normally with git. Clone ahead!'
		text += '\n'
		text += format.monospaceBlock(`git clone ${remote}`, 'sh')
		text += '\n'
	} else {
		text += 'Its currently disabled. You can enable that.'
	}

	return {text, parse_mode: format.parse_mode}
}

function generateSecret(): string {
	// Secret is a 3 digit value from the available 36 chars
	const timePart = Date.now() % (36 ** 3)
	return timePart.toString(36)
}

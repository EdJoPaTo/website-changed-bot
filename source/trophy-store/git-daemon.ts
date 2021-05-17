import {mkdirSync, readdirSync, unlinkSync} from 'fs'
import {execSync} from 'child_process'

import {gitCommand} from './git.js'

let linkFolder: string

export function init(linkFolderRelative: string): void {
	const folder = linkFolderRelative + 'test'
	mkdirSync(folder, {recursive: true})
	gitCommand(folder, 'init')

	linkFolder = linkFolderRelative
}

export function linkName(issuer: string, secret: string): string {
	return issuer + '-' + secret
}

export function generateRemote(issuer: string, secret: string): string {
	const host = process.env['PUBLIC_HOSTNAME'] ?? 'localhost'
	return `git://${host}/${linkName(issuer, secret)}/`
}

export function getCurrentSecret(issuer: string): string | undefined {
	const prefix = issuer + '-'
	const link = readdirSync(linkFolder)
		.find(o => o.startsWith(prefix))
	if (!link) {
		return undefined
	}

	return link.slice(prefix.length)
}

export function removeLink(issuer: string): void {
	const all = readdirSync(linkFolder)
		.filter(o => o.startsWith(issuer + '-'))

	for (const link of all) {
		unlinkSync(linkFolder + link)
	}
}

export function createLink(issuer: string, secret: string): void {
	removeLink(issuer)
	const existing = '../folders/' + issuer
	const newPath = linkFolder + linkName(issuer, secret)
	execSync(`ln -sf ${existing} ${newPath}`)
}

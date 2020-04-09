import {readFileSync, promises as fsPromises} from 'fs'

import * as stringify from 'json-stable-stringify'
import {ContextMessageUpdate} from 'telegraf'

const USERS_FILE = './persistent/users.json'

export interface User {
	websites: Record<string, string>;
}

let users: Record<number, User>
try {
	users = JSON.parse(readFileSync(USERS_FILE, 'utf8'))
} catch (_) {
	users = {}
	console.error(`The admin has to write the first message to the bot. If someone else is faster, he will be the admin. (Admin is the first one in the "${USERS_FILE}".)`)
}

async function saveUsersFile(): Promise<void> {
	await fsPromises.writeFile(USERS_FILE, stringify(users, {space: 2}))
}

export function getUsers(): readonly number[] {
	return Object.keys(users).map(id => Number(id))
}

export function getAdmin(): number {
	// Assume first user in file is admin
	return getUsers()[0]
}

export async function addUser(userID: number): Promise<void> {
	users[userID] = {websites: {}}
	return saveUsersFile()
}

export function getUserSettings(userID: number): User {
	return users[userID] || {}
}

export async function setUserSettings(userID: number, settings: User): Promise<void> {
	users[userID] = settings
	return saveUsersFile()
}

export function middleware(): (ctx: ContextMessageUpdate, next?: () => Promise<void>) => Promise<void> {
	return async (ctx, next) => {
		const user = ctx.from && ctx.from.id
		if (!user) {
			return next?.()
		}

		(ctx as any).session = getUserSettings(user)
		const before = JSON.stringify((ctx as any).session)
		await next?.()
		const after = JSON.stringify((ctx as any).session)
		// Debug
		// console.log('middleware', user)
		// console.log('before', before)
		// console.log('after ', after)

		if (before !== after) {
			await setUserSettings(user, (ctx as any).session)
		}
	}
}

import {readFileSync, promises as fsPromises} from 'fs'

import * as stringify from 'json-stable-stringify'
import {Context as TelegrafContext} from 'telegraf'

const USERS_FILE = './persistent/users.json'

export interface User {
	admin?: boolean;
}

let users: Record<number, User>
try {
	users = JSON.parse(readFileSync(USERS_FILE, 'utf8'))
} catch {
	users = {}
	console.error(`The admin has to write the first message to the bot. If someone else is faster, he will be the admin. (Admin is set in "${USERS_FILE}".)`)
}

async function saveUsersFile(): Promise<void> {
	await fsPromises.writeFile(USERS_FILE, stringify(users, {space: 2}))
}

export function getUsers(): readonly number[] {
	return Object.keys(users).map(id => Number(id))
}

export function getAdmin(): number {
	const userId = Object.keys(users)
		.map(o => Number(o))
		.find(o => users[o].admin)
	if (!userId) {
		throw new Error('The admin has to write the first message to the bot. If someone else is faster, he will be the admin.')
	}

	return userId
}

export async function addUser(userID: number, isAdmin: boolean): Promise<void> {
	users[userID] = {admin: isAdmin}
	return saveUsersFile()
}

export function getUserSettings(userID: number): User {
	return users[userID] || {}
}

export async function setUserSettings(userID: number, settings: User): Promise<void> {
	users[userID] = {
		admin: settings.admin
	}
	return saveUsersFile()
}

export function middleware(): (ctx: TelegrafContext, next: () => Promise<void>) => Promise<void> {
	return async (ctx, next) => {
		const user = ctx.from?.id
		if (!user) {
			return next()
		}

		(ctx as any).session = getUserSettings(user)
		const before = JSON.stringify((ctx as any).session)
		await next()
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

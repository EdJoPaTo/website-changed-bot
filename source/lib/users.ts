import {KeyValueInMemoryFile} from '@edjopato/datastore'

const USERS_FILE = './persistent/users.json'

export interface UserData {
	readonly admin: boolean;
	groups: number[];
}

const users = new KeyValueInMemoryFile<UserData>(USERS_FILE)

if (users.keys().length === 0) {
	console.error(`The admin has to write the first message to the bot. If someone else is faster, he will be the admin. (Admin is set in "${USERS_FILE}".)`)
}

export function getUsers(): readonly number[] {
	return users.keys().map(id => Number(id))
}

export function getAdmin(): number {
	const userId = users.keys()
		.find(o => users.get(o)?.admin)
	if (!userId) {
		throw new Error('The admin has to write the first message to the bot. If someone else is faster, he will be the admin.')
	}

	return Number(userId)
}

export async function addUser(userID: number, isAdmin: boolean): Promise<void> {
	await setUserSettings(userID, {
		admin: isAdmin,
		groups: []
	})
}

export function getUserSettings(userID: number): UserData | undefined {
	const stored = users.get(String(userID))
	if (!stored) {
		return undefined
	}

	if (!stored.groups) {
		stored.groups = []
	}

	return stored
}

export async function setUserSettings(userID: number, settings: UserData): Promise<void> {
	await users.set(String(userID), settings)
}

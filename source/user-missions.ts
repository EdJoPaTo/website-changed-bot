import {JsonFileStore} from './file-store'
import {Mission} from './mission'

export const userMissions = new JsonFileStore<Mission[]>('users/missions/')

export function getAll(issuer: string): readonly Mission[] {
	return userMissions.get(issuer) ?? []
}

export function getIndex(issuer: string, index: number): Mission {
	const all = getAll(issuer)
	if (index < 0 || index >= all.length) {
		throw new Error('index out of range')
	}

	return all[index]
}

export function update(issuer: string, updated: Mission): void {
	const current = userMissions.get(issuer) ?? []
	const index = current
		.map(o => `${o.type} ${o.uniqueIdentifier}`)
		.indexOf(`${updated.type} ${updated.uniqueIdentifier}`)

	if (index < 0) {
		throw new Error('mission to update does not exist')
	}

	const newContent = [...current]
	newContent.splice(index, 1, updated)
	userMissions.set(issuer, newContent)
}

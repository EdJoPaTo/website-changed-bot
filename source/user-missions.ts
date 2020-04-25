import {JsonFileStore} from './file-store'
import {Mission} from './hunter'

export const userMissions = new JsonFileStore<Mission[]>('users/missions/')

export function getAll(issuer: string): readonly Mission[] {
	return userMissions.get(issuer) ?? []
}

export function getByIndex(issuer: string, index: number): Mission {
	const all = getAll(issuer)
	if (index < 0 || index >= all.length) {
		throw new Error('index out of range')
	}

	return all[index]
}

function indexOfIdentifier(missions: readonly Mission[], type: string, uniqueIdentifier: string): number {
	return missions
		.map(o => `${o.type} ${o.uniqueIdentifier}`)
		.indexOf(`${type} ${uniqueIdentifier}`)
}

export function update(issuer: string, updated: Mission): void {
	const current = getAll(issuer)
	const index = indexOfIdentifier(current, updated.type, updated.uniqueIdentifier)
	if (index < 0) {
		throw new Error('mission to update does not exist')
	}

	const newContent = [...current]
	newContent.splice(index, 1, updated)
	userMissions.set(issuer, newContent)
}

export function add(issuer: string, ...add: readonly Mission[]) {
	const current = getAll(issuer)
	for (const mission of add) {
		if (indexOfIdentifier(current, mission.type, mission.uniqueIdentifier) >= 0) {
			throw new Error('A similar mission already exists. Maybe update instead?')
		}
	}

	const all = [
		...current,
		...add
	]
	userMissions.set(issuer, all)
}

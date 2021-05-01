import {JsonFileStore} from './file-store.js'
import {Mission, Type, generateFilename} from './hunter/index.js'

export const userMissions = new JsonFileStore<Mission[]>('users/missions/')

export function getAll(issuer: string): readonly Mission[] {
	return userMissions.get(issuer) ?? []
}

export function getByIndex(issuer: string, index: number): Mission {
	const mission = getAll(issuer)[index]
	if (!mission) {
		throw new Error('index out of range')
	}

	return mission
}

function indexOf(missions: readonly Mission[], url: string, type: Type): number {
	return missions
		.map(o => generateFilename(o.url, o.type))
		.indexOf(generateFilename(url, type))
}

export function update(issuer: string, updated: Mission): void {
	const current = getAll(issuer)
	const index = indexOf(current, updated.url, updated.type)
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
		if (indexOf(current, mission.url, mission.type) >= 0) {
			throw new Error('A similar mission already exists. Maybe update instead?')
		}
	}

	const all = [
		...current,
		...add
	]
	userMissions.set(issuer, all)
}

export function remove(issuer: string, remove: Mission) {
	const removeFilename = generateFilename(remove.url, remove.type)
	const current = getAll(issuer)
	const all = current
		.filter(o => generateFilename(o.url, o.type) !== removeFilename)
	userMissions.set(issuer, all)
}

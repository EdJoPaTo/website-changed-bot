import {checkMany} from './hunter'
import {getStore, finalizeStore} from './trophy-store'
import {Mission} from './mission'
import {NotifyChangeFunction, NotifyErrorFunction, Directions} from './hunter/directions'
import {sleep} from './async'
import {Store} from './store'
import {userMissions} from './user-missions'

export async function checkRunner(notifyChange: NotifyChangeFunction<Mission>, notifyError: NotifyErrorFunction<Mission>): Promise<void> {
	await run(notifyChange, notifyError)
	await sleep(15000)
	await run(notifyChange, notifyError)
	await sleep(15000)
	await run(notifyChange, notifyError)
}

async function run(notifyChange: NotifyChangeFunction<Mission>, notifyError: NotifyErrorFunction<Mission>): Promise<void> {
	const issuers = userMissions.keys()
		.filter(o => o.startsWith('tg'))
	const directions = await directionsOfIssuers(issuers, notifyChange, notifyError)

	await checkMany(directions)

	for (const issuer of issuers) {
		finishUpIssuer(issuer)
	}
}

function filenameOfMission(mission: Mission): string {
	return mission.uniqueIdentifier + '.' + mission.type
}

function finishUpIssuer(issuer: string): void {
	const missions = userMissions.get(issuer) ?? []
	finalizeStore(issuer, missions.map(filenameOfMission))
}

async function directionsOfIssuers(issuers: readonly string[], notifyChange: NotifyChangeFunction<Mission>, notifyError: NotifyErrorFunction<Mission>): Promise<ReadonlyArray<Directions<Mission>>> {
	const directionsArrayArray = await Promise.all(issuers
		.map(async o => directionsOfIssuer(o, notifyChange, notifyError))
	)
	return directionsArrayArray.flat(1)
}

async function directionsOfIssuer(issuer: string, notifyChange: NotifyChangeFunction<Mission>, notifyError: NotifyErrorFunction<Mission>): Promise<Array<Directions<Mission>>> {
	const store = getStore(issuer)
	const missions = userMissions.get(issuer) ?? []

	const directions = await Promise.all(missions
		.map(async (mission): Promise<Directions<Mission>> => {
			const key = filenameOfMission(mission)
			const currentContent = await store.get(key)
			const saveNewContent = generateSaveFunction(store, key)
			return {
				mission,
				currentContent,
				saveNewContent,
				notifyChange,
				notifyError
			}
		})
	)

	return directions
}

function generateSaveFunction(store: Store<string>, key: string): (content: string) => Promise<void> {
	return async content => {
		await store.set(key, content)
	}
}

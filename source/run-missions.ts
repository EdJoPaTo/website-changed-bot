import {checkMany, Mission, generateFilename} from './hunter'
import {getStore, finalizeStore} from './trophy-store'
import {NotifyChangeFunction, NotifyErrorFunction, Directions} from './hunter/directions'
import {generateEndlessLoopRunner} from './async'
import {userMissions} from './user-missions'

const SECOND = 1000
const MINUTE = 60 * SECOND

const BETWEEN_TWO_RUNS = 10 * MINUTE
const BETWEEN_SAME_DOMAIN_CHECKS = 10 * SECOND

export async function checkRunner(notifyChange: NotifyChangeFunction<Mission>, notifyError: NotifyErrorFunction<Mission>): Promise<void> {
	const endless = generateEndlessLoopRunner(async () => run(notifyChange, notifyError), BETWEEN_TWO_RUNS)
	await endless()
}

async function run(notifyChange: NotifyChangeFunction<Mission>, notifyError: NotifyErrorFunction<Mission>): Promise<void> {
	const issuers = userMissions.keys()
		.filter(o => o.startsWith('tg'))
	const directions = await directionsOfIssuers(issuers, notifyChange, notifyError)

	await checkMany(directions, BETWEEN_SAME_DOMAIN_CHECKS)

	for (const issuer of issuers) {
		finishUpIssuer(issuer)
	}
}

function finishUpIssuer(issuer: string): void {
	const missions = userMissions.get(issuer) ?? []
	finalizeStore(issuer, missions.map(o => generateFilename(o.url, o.type)))
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
			return {
				issuer,
				mission,
				store,
				notifyChange,
				notifyError
			}
		})
	)

	return directions
}

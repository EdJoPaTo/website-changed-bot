import arrayReduceGroupBy from 'array-reduce-group-by'

import {runSequentiallyWithDelayInBetween} from '../async'

import {Directions, SaveNewContentFunction} from './directions'
import {getCurrent} from './individuals'
import {getDomainFromUrl} from './url-logic'
import {Mission} from './mission'

export * from './mission'

export async function checkMany<TMission extends Mission>(directions: ReadonlyArray<Directions<TMission>>): Promise<void> {
	const groupedByDomain = directions
		.reduce(arrayReduceGroupBy(o => getDomainFromUrl(o.mission.url)), {})

	await Promise.all(Object.keys(groupedByDomain)
		.map(async group => checkGroup(groupedByDomain[group]))
	)
}

async function checkGroup<TMission extends Mission>(directions: ReadonlyArray<Directions<TMission>>): Promise<void> {
	await runSequentiallyWithDelayInBetween(checkOne, directions, 5000)
}

export async function checkOne<TMission extends Mission>(directions: Directions<TMission>): Promise<void> {
	try {
		const change = await hasChanged(directions.mission, directions.currentContent, directions.saveNewContent)
		await directions.notifyChange(directions.mission, change)
	} catch (error) {
		await directions.notifyError(directions.mission, error)
	}
}

async function hasChanged(mission: Mission, lastContent: string | undefined, saveNewContent: SaveNewContentFunction): Promise<boolean | undefined> {
	const newContent = await getCurrent(mission)

	if (lastContent === undefined) {
		await saveNewContent(newContent)
		return undefined
	}

	if (lastContent !== newContent) {
		await saveNewContent(newContent)
		return true
	}

	return false
}

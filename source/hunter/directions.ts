import {Store} from '../store.js'

import {Mission} from './mission.js'

export type NotifyChangeFunction<TMission> = (issuer: string, mission: TMission, change: boolean | undefined) => void | Promise<void>
export type NotifyErrorFunction<TMission> = (issuer: string, mission: TMission, error: unknown) => void | Promise<void>

/**
 * Directions contain information for hunters what their mission goal is and what to do on their way and when they reach it
 */
export interface Directions<TMission extends Mission> {
	readonly issuer: string;
	readonly mission: TMission;
	readonly store: Store<string>;
	readonly notifyChange: NotifyChangeFunction<TMission>;
	readonly notifyError: NotifyErrorFunction<TMission>;
}

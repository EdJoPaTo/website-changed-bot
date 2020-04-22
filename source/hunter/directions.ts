import {Store} from '../store'

import {Mission} from './mission'

export type NotifyChangeFunction<TMission> = (mission: TMission, change: boolean | undefined) => void | Promise<void>
export type NotifyErrorFunction<TMission> = (mission: TMission, error: any) => void | Promise<void>

/**
 * Directions contain information for hunters what their mission goal is and what to do on their way and when they reach it
 */
export interface Directions<TMission extends Mission> {
	readonly mission: TMission;
	readonly store: Store<string>;
	readonly notifyChange: NotifyChangeFunction<TMission>;
	readonly notifyError: NotifyErrorFunction<TMission>;
}

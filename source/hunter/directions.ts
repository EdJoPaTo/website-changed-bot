import {Mission} from './mission'

export type SaveNewContentFunction = (newContent: string) => void | Promise<void>
export type NotifyChangeFunction<TMission> = (mission: TMission, change: boolean | undefined) => void | Promise<void>
export type NotifyErrorFunction<TMission> = (mission: TMission, error: any) => void | Promise<void>

/**
 * Directions contain information for hunters what their mission goal is and what to do on their way and when they reach it
 */
export interface Directions<TMission extends Mission> {
	readonly mission: TMission;
	readonly currentContent: string | undefined;
	readonly saveNewContent: SaveNewContentFunction;
	readonly notifyChange: NotifyChangeFunction<TMission>;
	readonly notifyError: NotifyErrorFunction<TMission>;
}

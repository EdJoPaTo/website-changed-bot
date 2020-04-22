import type * as Hunter from './hunter'

export type Mission = BaseMission & Hunter.Mission
export type Type = Hunter.Type

export interface BaseMission {
	readonly issuer: string;
	readonly uniqueIdentifier: string;
}

export function generateUniqueKeyForUrl(url: string): string {
	return url.replace(/[-_:;*?"<>|.&?=/\\]+/g, ' ').trim().replace(/ +/g, '-')
}

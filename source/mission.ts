export type Type =
	'head' |
	'html'

export type Mission = HtmlMission | HeadMission

interface BaseMission {
	readonly type: Type;
	readonly uniqueIdentifier: string;
	readonly url: string;
}

export interface HeadMission extends BaseMission {
	readonly type: 'head';
	readonly ignoreHeader?: readonly string[];
}

export interface HtmlMission extends BaseMission {
	readonly type: 'html';
}

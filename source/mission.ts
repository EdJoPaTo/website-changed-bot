export type Mission =
	HtmlMission |
	HeadMission |
	JavaScriptMission |
	TextMission

export type Type = Mission["type"]

interface BaseMission {
	readonly issuer: string;
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

export interface JavaScriptMission extends BaseMission {
	readonly type: 'js';
}

export interface TextMission extends BaseMission {
	readonly type: 'txt';
}

export function generateUniqueKeyForUrl(url: string): string {
	return url.replace(/[-_:;.&?=/\\]+/g, ' ').trim().replace(/ +/g, '-')
}

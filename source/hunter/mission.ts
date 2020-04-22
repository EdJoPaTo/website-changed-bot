export type Mission =
	HeadMission |
	HtmlMission |
	JavaScriptMission |
	TextMission

export type Type = Mission['type']

interface Base {
	readonly url: string;
}

export interface HeadMission extends Base {
	readonly type: 'head';
	readonly ignoreHeader?: readonly string[];
}

export interface HtmlMission extends Base {
	readonly type: 'html';
}

export interface JavaScriptMission extends Base {
	readonly type: 'js';
}

export interface TextMission extends Base {
	readonly type: 'txt';
}

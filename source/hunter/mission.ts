export type Mission =
	HtmlMission |
	JavaScriptMission |
	JsonMission |
	TextMission |
	XmlMission

export type Type = Mission['type']
export const TYPES: Type[] = ['html', 'js', 'json', 'txt', 'xml']

export function stringIsType(type: string): type is Type {
	return (TYPES as string[]).includes(type)
}

export interface ContentReplace {
	readonly source: string;
	readonly flags: string;
	readonly replaceValue: string;
}

interface Base {
	readonly url: string;

	readonly contentReplace?: readonly ContentReplace[];
}

export interface HtmlMission extends Base {
	readonly type: 'html';
}

export interface JavaScriptMission extends Base {
	readonly type: 'js';
}

export interface JsonMission extends Base {
	readonly type: 'json';
}

export interface TextMission extends Base {
	readonly type: 'txt';
}

export interface XmlMission extends Base {
	readonly type: 'xml';
}

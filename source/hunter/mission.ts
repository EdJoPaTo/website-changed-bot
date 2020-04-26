export type Mission =
	HeadMission |
	HtmlMission |
	JavaScriptMission |
	TextMission |
	XmlMission

export type Type = Mission['type']
export const TYPES: Type[] = ['head', 'html', 'js', 'txt', 'xml']

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

export interface XmlMission extends Base {
	readonly type: 'xml';
}

function generateUniqueKeyForUrl(url: string, type: Type): string {
	return url
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.replace(new RegExp('\\.' + type + '$'), '')
		.replace(/index$/, '')
		.replace(/[-_:;*?"<>|.&=/\\]+/g, ' ')
		.trim()
		.replace(/ +/g, '-')
}

export function generateFilename(url: string, type: Type): string {
	return generateUniqueKeyForUrl(url, type) + '.' + type
}

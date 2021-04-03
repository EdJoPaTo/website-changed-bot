import {Context as TelegrafContext} from 'telegraf'

import {Type} from './hunter/index.js'

export interface Session {
	page?: number;
	addUrl?: string;
	addType?: Type;
	listTopLevel?: string;
	replacerRegexSource?: string;
	replacerRegexFlags?: string;
	replacerReplaceValue?: string;
}

export interface Context extends TelegrafContext {
	readonly match?: RegExpExecArray;
	session: Session;
}

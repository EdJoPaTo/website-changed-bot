import {Context as TelegrafContext} from 'telegraf'
import {Type} from './hunter'

export interface Session {
	page: number | undefined;
	addUrl?: string;
	addType?: Type;
	listTopLevel?: string;
	replacerRegexSource?: string;
	replacerRegexFlags?: string;
	replacerReplaceValue?: string;
}

export interface Context extends TelegrafContext {
	match?: RegExpExecArray;
	session: Session;
}

import {Context as TelegrafContext} from 'telegraf'
import {Type} from '../hunter'

export interface Session {
	page: number | undefined;
	addUrl?: string;
	addType?: Type;
	currentMissionIndex?: number;
	replacerRegexSource?: string;
	replacerRegexFlags?: string;
	replacerReplaceValue?: string;
}

export interface Context extends TelegrafContext {
	session: Session;
}

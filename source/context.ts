import {Context as BaseContext} from 'grammy'

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

export interface SessionContextFlavour {
	session: Session;
}

export type Context = BaseContext & SessionContextFlavour

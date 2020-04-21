import {mkdirSync, unlinkSync, rmdirSync, readFileSync, writeFileSync, readdirSync} from 'fs'

import {Store} from './store'

export class StringFileStore implements Store<string> {
	constructor(
		public readonly folder: string
	) {
		if (!folder.endsWith('/')) {
			throw new Error('folder has to end with a /')
		}

		mkdirSync(folder, {recursive: true})
	}

	keys(): string[] {
		const content = readdirSync(this.folder, {withFileTypes: true})
			.filter(o => o.isFile())
			.map(o => o.name)
		return content
	}

	get(key: string): string | undefined {
		try {
			return readFileSync(this.folder + key, 'utf8')
		} catch {
			return undefined
		}
	}

	set(key: string, value: string): void {
		writeFileSync(this.folder + key, value, 'utf8')
	}

	delete(key: string): boolean {
		try {
			unlinkSync(this.folder + key)
			return true
		} catch {
			return false
		}
	}

	clear(): void {
		try {
			rmdirSync(this.folder, {recursive: true})
		} catch {}
		mkdirSync(this.folder, {recursive: true})
	}
}

export class JsonFileStore<T> implements Store<T> {
	private readonly _stringFileStore: StringFileStore

	constructor(
		public readonly folder: string,
		public readonly serialise: (input: T) => string = input => JSON.stringify(input, undefined, '\t'),
		public readonly deserialise: (input: string) => T = input => JSON.parse(input)
	) {
		this._stringFileStore = new StringFileStore(folder)
	}

	get(key: string): T | undefined {
		const content = this._stringFileStore.get(key + '.json')
		if (!content) {
			return undefined
		}

		return this.deserialise(content)
	}

	set(key: string, value: Readonly<T>): void {
		const content = this.serialise(value)
		this._stringFileStore.set(key + '.json', content)
	}

	delete(key: string): boolean {
		return this._stringFileStore.delete(key + '.json')
	}

	clear(): void {
		this._stringFileStore.clear()
	}
}

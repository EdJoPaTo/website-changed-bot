// See keyv Store<T>

type ConstOrPromise<T> = T | Promise<T>

export interface Store<Value> {
	get(key: string): ConstOrPromise<Value | undefined>;
	set(key: string, value: Value, ttl?: number): this | ConstOrPromise<void>;
	delete(key: string): ConstOrPromise<boolean>;
	clear(): ConstOrPromise<void>;
}

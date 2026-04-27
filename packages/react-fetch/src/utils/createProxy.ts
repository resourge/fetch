import { isBuiltinWithMutableMethods } from './utils';

export type FilterKeysState = {
	all?: boolean
	keys: Set<string>
	state?: FilterKeysState
};

export function createProxy<T extends object>(
	target: T,
	state: FilterKeysState,
	isRecursive: boolean = false
): T {
	// Recursively create a proxy for nested objects
	state.state = state.state ?? {
		all: false,
		keys: new Set()
	};

	return new Proxy<T>(target, {
		get(target, key) {
			const value = target[key as keyof T];

			if (!isRecursive && key !== 'filter') {
				return value;
			}

			state.keys.add(String(key));

			if (
				typeof value === 'object'
				&& value !== null
				&& !isBuiltinWithMutableMethods(value)
			) {
				return createProxy(value, state.state!, true);
			}

			return value;
		},
		ownKeys(target) {
			state.all = true;
			return Reflect.ownKeys(target);
		}
	});
}

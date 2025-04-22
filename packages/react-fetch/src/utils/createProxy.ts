import { isBuiltinWithMutableMethods } from './utils';

export type FilterKeysState = {
	keys: Set<string>
	all?: boolean
	state?: FilterKeysState
}

export function createProxy(
	target: any, 
	state: FilterKeysState,
	isRecursive: boolean = false
) {
	// Recursively create a proxy for nested objects
	state.state = state.state ?? {
		keys: new Set(),
		all: false
	}

	return new Proxy(target, {
		get(target, key) {
			const value = target[key];

			if ( !isRecursive && key !== 'filter' ) {
				return value;
			}

			state.keys.add(String(key));

			if ( 
				typeof value === 'object' && 
				value !== null && 
				!isBuiltinWithMutableMethods(value)
			) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return createProxy(value, state.state!, true)
			}

			return value;
		},
		ownKeys(target) {
			state.all = true;
			return Reflect.ownKeys(target);
		}
	});
}

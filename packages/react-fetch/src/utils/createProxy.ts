import { isBuiltinWithMutableMethods } from './utils';

export type FilterKeysState = {
	keys: Set<string>
	state?: FilterKeysState
}

export function createProxy(
	target: any, 
	state: FilterKeysState
) {
	// Recursively create a proxy for nested objects
	state.state = state.state ?? {
		keys: new Set()
	}

	return new Proxy(target, {
		get(target, key) {
			state.keys.add(String(key));
			const value = target[key];

			if ( typeof value === 'object' && value !== null && !isBuiltinWithMutableMethods(value)) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return createProxy(value, state.state!)
			}

			return value;
		}
	});
}

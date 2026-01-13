import { useRef } from 'react';

// To remove after 19.2
export const useEffectEvent = <const T extends ((...args: any[]) => any) | undefined>(method: T): T => {
	const methodRef = useRef(method);

	methodRef.current = method;

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return (method ? (...args) => methodRef.current!(...args) : undefined) as T
}

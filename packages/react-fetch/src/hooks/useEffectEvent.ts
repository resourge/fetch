import { useRef } from 'react';

// To remove after 19.2
export const useEffectEvent = <const T extends (...args: any[]) => any>(method: T): T => {
	const methodRef = useRef(method);

	methodRef.current = method;

	return ((...args) => methodRef.current(...args)) as T
}

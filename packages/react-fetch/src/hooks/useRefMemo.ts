import { useEffect, useRef } from 'react'

export const useRefMemo = <T>(cb: () => T): T => {
	const memoRef = useRef<T | undefined>(undefined);
	if ( !memoRef.current ) {
		memoRef.current = cb();
	}

	// To fix hot-reload not working as expected
	useEffect(() => {
		return () => {
			memoRef.current = undefined;
		}
	}, [])

	return memoRef.current;
}

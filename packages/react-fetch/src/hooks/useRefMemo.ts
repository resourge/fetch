import { useRef } from 'react'

export const useRefMemo = <T>(cb: () => T): React.MutableRefObject<T> => {
	const memoRef = useRef<T | undefined>(undefined);
	if ( !memoRef.current ) {
		memoRef.current = cb();
	}

	return memoRef as React.MutableRefObject<T>;
}

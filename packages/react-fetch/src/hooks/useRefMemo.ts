import { useRef } from 'react';

export const useRefMemo = <T>(cb: () => T): React.RefObject<T> => {
	const memoRef = useRef<T | undefined>(undefined);
	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	if (!memoRef.current) {
		memoRef.current = cb();
	}

	return memoRef as React.RefObject<T>;
};

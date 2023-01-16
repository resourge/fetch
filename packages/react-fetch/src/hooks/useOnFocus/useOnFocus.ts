import { useEffect } from 'react';

export const useOnFocus = (
	cb: () => {
		blur: () => void
		clear: () => void
		focus: () => void
	},
	onWindowFocus?: boolean
) => {
	useEffect(() => {
		if ( onWindowFocus ) {
			const {
				focus, blur, clear 
			} = cb();

			const visibilitychange = () => {
				if ( document.visibilityState === 'visible' ) {
					focus();
				}
				else {
					blur();
				}
			}

			if ( typeof window !== 'undefined' ) {
				window.addEventListener('focus', focus); 
				window.addEventListener('blur', blur);
				window.addEventListener('visibilitychange', visibilitychange);

				return () => {
					clear();
					window.removeEventListener('focus', focus); 
					window.removeEventListener('blur', blur);
					window.removeEventListener('visibilitychange', visibilitychange);
				}
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onWindowFocus])
}

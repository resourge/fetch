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
		if (onWindowFocus) {
			const {
				blur, clear, focus
			} = cb();

			const visibilitychange = () => {
				if (document.visibilityState === 'visible') {
					focus();
				}
				else {
					blur();
				}
			};

			window.addEventListener('focus', focus);
			window.addEventListener('blur', blur);
			globalThis.addEventListener('visibilitychange', visibilitychange);

			return () => {
				clear();
				window.removeEventListener('focus', focus);
				window.removeEventListener('blur', blur);
				globalThis.removeEventListener('visibilitychange', visibilitychange);
			};
		}
	}, [onWindowFocus]);
};

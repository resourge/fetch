import { useEffect } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';

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

			const onAppStateChange = (status: AppStateStatus) => {
				if (Platform.OS !== 'web') {
					if (status === 'active') {
						focus();
						return;
					}
					blur();
				}
			};

			const subscription = AppState.addEventListener('change', onAppStateChange);

			return () => {
				clear();
				subscription.remove();
			};
		}
	}, [onWindowFocus]);
};

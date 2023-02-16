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
		if ( onWindowFocus ) {
			const {
				focus, blur, clear 
			} = cb();

			const onAppStateChange = (status: AppStateStatus) => {
				if (Platform.OS !== 'web') {
					if ( status === 'active' ) {
						focus();
						return;
					}
					blur();
				}
			}

			const subscription = AppState.addEventListener('change', onAppStateChange)

			return () => {
				clear();
				subscription.remove()
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onWindowFocus])
}

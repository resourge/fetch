import { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

export const useOnFocus = (
	cb: () => {
		blur: () => void
		focus: () => void
	},
	onWindowFocus?: boolean
) => {
	useEffect(() => {
		if ( onWindowFocus ) {
			const { focus, blur } = cb();

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
				subscription.remove()
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onWindowFocus])
}

import { useEffect, useState } from 'react';

export interface IsOnlineValues {
	error: null | string
	isOffline: boolean
	isOnline: boolean
}

const missingWindow = typeof window === 'undefined';

const missingNavigator = typeof navigator === 'undefined';

const useIsOnline = missingWindow || missingNavigator 
	? () => false 
	: () => {
		const [isOnline, setOnlineStatus] = useState(window.navigator.onLine);

		useEffect(() => {
			const toggleOnlineStatus = () => {
				setOnlineStatus(window.navigator.onLine); 
			};

			window.addEventListener('online', toggleOnlineStatus);
			window.addEventListener('offline', toggleOnlineStatus);

			return () => {
				window.removeEventListener('online', toggleOnlineStatus);
				window.removeEventListener('offline', toggleOnlineStatus);
			};
		}, [isOnline]);

		return isOnline;
	};

export { useIsOnline };

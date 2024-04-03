import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { OnlineSubscribe, OnlineGetSnapshot } from '../utils/onlineUtils/OnlineUtils';

export const useIsOnline = () => {
	return useSyncExternalStore(OnlineSubscribe, OnlineGetSnapshot, OnlineGetSnapshot);
};

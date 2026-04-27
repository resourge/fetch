import { useSyncExternalStore } from 'react';

import { OnlineGetSnapshot, OnlineSubscribe } from '../utils/onlineUtils/OnlineUtils';

export const useIsOnline = () => useSyncExternalStore(OnlineSubscribe, OnlineGetSnapshot, OnlineGetSnapshot);

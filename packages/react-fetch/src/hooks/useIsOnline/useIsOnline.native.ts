import { useEffect, useState } from 'react';

import NetInfo from '@react-native-community/netinfo';

let globalState = true;

NetInfo.fetch()
.then((state) => {
	globalState = Boolean(state.isConnected);
})

export const useIsOnline = () => {
	const [isConnected, setIsConnected] = useState(globalState);

	useEffect(() => {
		const remove = NetInfo.addEventListener((state) => {
			setIsConnected(state.isConnected === true);
		})

		return () => {
			remove();
		}
	}, [])

	return isConnected;
}

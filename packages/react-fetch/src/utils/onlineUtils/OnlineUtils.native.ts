import NetInfo from '@react-native-community/netinfo';

const globalState = {
	current: true
};

NetInfo.fetch()
.then((state) => {
	globalState.current = Boolean(state.isConnected);
})

/**
 * Returns the current network connectivity status.
 * @returns {boolean} True if connected, false otherwise.
 */
export function OnlineGetSnapshot() {
	return globalState.current;
}
/**
 * Subscribes to network connectivity changes.
 * @param {Function} callback - Function to call when network status changes.
 * @returns {Function} A function to unsubscribe from the network status updates.
 */
export function OnlineSubscribe(callback: () => void) {
	const remove = NetInfo.addEventListener((state) => {
		globalState.current = state.isConnected === true;
		callback();
	})
	return () => {
		remove()
	};
}

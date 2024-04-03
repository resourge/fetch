import NetInfo from '@react-native-community/netinfo';

const globalState = {
	current: true
};

NetInfo.fetch()
.then((state) => {
	globalState.current = Boolean(state.isConnected);
})

export function OnlineGetSnapshot() {
	return globalState.current;
}

export function OnlineSubscribe(callback: () => void) {
	const remove = NetInfo.addEventListener((state) => {
		globalState.current = state.isConnected === true;
		callback();
	})
	return () => {
		remove()
	};
}

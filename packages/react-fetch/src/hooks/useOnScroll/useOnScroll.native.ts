import { MutableRefObject, useEffect, useRef } from 'react'
import { NativeSyntheticEvent, NativeScrollEvent, ScrollView } from 'react-native';

import { ScrollPos } from './types';

export type ElementWithScrollTo = ScrollView

export const useOnScroll = <T extends ElementWithScrollTo | null>(
	scrollMethod: (position: ScrollPos) => void
): [
	ref: MutableRefObject<T | null>, 
	onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
] => {
	const ref = useRef<T>(null);
	const onScrollRef = useRef<(position: ScrollPos) => void>(scrollMethod);

	onScrollRef.current = scrollMethod;

	if ( __DEV__ ) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if ( !ref.current ) {
				throw new Error('On react-native \'ref\' needs to be set, as react-native doesn\'t have window')
			}
		}, [])
	}

	const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		onScrollRef.current(
			{
				left: event.nativeEvent.contentOffset.x,
				top: event.nativeEvent.contentOffset.y
			}
		);
	}

	return [ref, onScroll];
}

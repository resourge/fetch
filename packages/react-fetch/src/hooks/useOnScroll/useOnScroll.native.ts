import { useEffect, useRef, type MutableRefObject } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { IS_DEV } from '../../utils/constants';

import { type ScrollPos } from './types';

export type ElementWithScrollTo = {
	scrollToOffset: (params: {
		offset: number
		animated?: boolean | null | undefined
	}) => void
}

export const useOnScroll = <T extends ElementWithScrollTo | null>(
	scrollMethod: (position: ScrollPos) => void
): [
	ref: MutableRefObject<T | null>, 
	onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
] => {
	const ref = useRef<T>(null);
	const onScrollRef = useRef<(position: ScrollPos) => void>(scrollMethod);

	onScrollRef.current = scrollMethod;

	if ( IS_DEV ) {
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

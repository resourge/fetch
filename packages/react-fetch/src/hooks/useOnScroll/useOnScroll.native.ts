import { type RefObject, useEffect, useRef } from 'react';
import { useEffectEvent } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { IS_DEV } from '../../utils/constants';

import { type ScrollPos } from './types';

export type ElementWithScrollTo = {
	scrollToOffset: (params: {
		animated?: boolean | null | undefined
		offset: number
	}) => void
};

export const useOnScroll = <T extends ElementWithScrollTo | null>(
	scrollMethod: (position: ScrollPos) => void
): [
		ref: RefObject<null | T>,
		onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
] => {
	const ref = useRef<T>(null);
	const onScrollRef = useEffectEvent<(position: ScrollPos) => void>(scrollMethod);

	if (IS_DEV) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (!ref.current) {
				throw new Error('On react-native \'ref\' needs to be set, as react-native doesn\'t have window');
			}
		}, []);
	}

	const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		onScrollRef(
			{
				left: event.nativeEvent.contentOffset.x,
				top: event.nativeEvent.contentOffset.y
			}
		);
	};

	return [ref, onScroll];
};

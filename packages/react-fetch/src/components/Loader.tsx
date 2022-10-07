import React, { useCallback } from 'react';

import { useSyncExternalStore } from 'use-sync-external-store/shim';

import LoadingService from '../../../http-service/src/services/LoadingService';

import { globalLoading } from './globalLoader/constants';

export type LoaderProps = {
	children?: React.ReactNode
	/**
	 * Unique id to distinct Loader from other loaders.
	 * Serves as a way to manually trigger distinct loaders.
	 * * Note: In case it's undefined, it will be treated as a global loader
	 * @default ''
	 */
	loaderId?: string
	/**
	 * Loading element.
	 * * Note: When set in a GlobalLoader, it will change the default loading element
	 * * for every Loader
	 */
	loadingElement?: React.ReactNode
}

/**
 * Component with loaderId to trigger loading at the useFetch or LoadingService command.
 */
const Loader: React.FC<LoaderProps> = ({ 
	loaderId, 
	children,
	loadingElement = globalLoading
}) => {
	const loading = useSyncExternalStore(
		useCallback((notify) => LoadingService.addListener(loaderId, notify), [loaderId]),
		() => LoadingService.getLoading(loaderId)
	)

	return (
		<>
			{ 
				loading 
					? loadingElement
					: children 
			}
		</>
	)
};

export default Loader;

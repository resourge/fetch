import React from 'react';

import Loader from '../Loader';

import { GlobalLoading } from './GlobalLoading';
import { BaseGlobalLoaderProps, globalColor, setGlobalLoading } from './constants'

export type GlobalLoaderProps = BaseGlobalLoaderProps<React.CSSProperties>

/**
 * Component with loaderId to trigger loading at the useFetch or LoadingService command.
 * Serves as the global type, where it shows the loading on the entire page.
 * By default loaderId is ''.
 */
// eslint-disable-next-line react/no-multi-comp
const GlobalLoader: React.FC<GlobalLoaderProps> = ({
	loaderId, style, children, color = globalColor
}) => {
	const globalLoading = setGlobalLoading(children ?? <GlobalLoading color={color} />)

	return (
		<Loader 
			loaderId={loaderId}
			loadingElement={(
				<div 
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'rgba(0,0,0,0.5)',
						zIndex: 10000,
						...style
					}}
				>
					{ globalLoading }
				</div>
			)}
		/>
	)
};

export default GlobalLoader;

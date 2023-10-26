import React, { useState } from 'react';

import { createPortal } from 'react-dom';

import Loader from '../Loader';

import { GlobalLoading } from './GlobalLoading';
import { type BaseGlobalLoaderProps, globalColor, setGlobalLoading } from './constants'

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
	const [portalContainer] = useState(() => {
		let portalContainer = document.getElementById('global-loader');

		if ( !portalContainer ) {
			portalContainer = document.createElement('div');

			portalContainer.id = 'global-loader';

			document.body.appendChild(portalContainer)
		}

		return portalContainer
	})
	const globalLoading = setGlobalLoading(children ?? <GlobalLoading color={color} />)

	return (
		<Loader 
			loaderId={loaderId}
			loadingElement={(
				createPortal(
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
							backgroundColor: 'rgba(0,0,0,0.25)',
							zIndex: 10000,
							WebkitBackdropFilter: 'blur(3px)',
							backdropFilter: 'blur(3px)',
							...style
						}}
					>
						{ globalLoading }
					</div>,
					portalContainer
				)
			)}
		/>
	)
};

export default GlobalLoader;

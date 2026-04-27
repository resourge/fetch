import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import Loader from '../Loader';

import { type BaseGlobalLoaderProps, globalColor, setGlobalLoading } from './constants';
import { GlobalLoading } from './GlobalLoading';

export type GlobalLoaderProps = BaseGlobalLoaderProps<React.CSSProperties>;

/**
 * Component with loaderId to trigger loading at the useFetch or LoadingService command.
 * Serves as the global type, where it shows the loading on the entire page.
 * By default loaderId is ''.
 */
 
const GlobalLoader: React.FC<GlobalLoaderProps> = ({
	children, color = globalColor, loaderId, style
}) => {
	const [portalContainer] = useState(() => {
		let portalContainer = document.querySelector('#global-loader');

		if ( !portalContainer ) {
			portalContainer = document.createElement('div');

			portalContainer.id = 'global-loader';

			document.body.append(portalContainer);
		}

		return portalContainer;
	});
	const globalLoading = setGlobalLoading(children ?? <GlobalLoading color={color} />);

	return (
		<Loader 
			loaderId={loaderId}
			loadingElement={(
				createPortal(
					<div 
						style={{
							alignItems: 'center',
							backdropFilter: 'blur(3px)',
							backgroundColor: 'rgba(0,0,0,0.25)',
							bottom: 0,
							display: 'flex',
							justifyContent: 'center',
							left: 0,
							position: 'fixed',
							right: 0,
							top: 0,
							WebkitBackdropFilter: 'blur(3px)',
							zIndex: 10_000,
							...style
						}}
					>
						{ globalLoading }
					</div>,
					portalContainer
				)
			)}
		/>
	);
};

export default GlobalLoader;

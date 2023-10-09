import React from 'react';
import { type ReactNode, Suspense } from 'react';

import LoadingFallback from './LoadingFallback';

type Props = {
	children?: ReactNode
}

/**
 * Component that show loading on lazy components.
 */
const LoadingSuspense: React.FC<Props> = ({ children }) => (
	<Suspense fallback={<LoadingFallback />}>
		{ children }
	</Suspense>
);

export default LoadingSuspense;

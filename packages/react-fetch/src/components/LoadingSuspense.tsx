import type React from 'react';
import { useEffect } from 'react';

import { LoadingService } from 'packages/http-service/src';

/**
 * Component to show loading on Suspense component
 */
const LoadingSuspense: React.FC = () => {
	useEffect(() => {
		LoadingService.show();
		return () => {
			LoadingService.hide();
		};
	}, []);

	return null;
};

export default LoadingSuspense;

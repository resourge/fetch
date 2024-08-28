import type React from 'react';
import { useEffect } from 'react';

import { LoadingService } from '../../../http-service/src';

/**
 * Component that shows loading on mount and hides loading on unmount
 */
const LoadingFallback: React.FC = () => {
	useEffect(() => {
		LoadingService.show();
		return () => {
			LoadingService.hide();
		};
	}, []);

	return null;
};

export default LoadingFallback;

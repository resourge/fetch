import { LoaderProps } from '../Loader'

import { GlobalLoading } from './GlobalLoading';

export const globalColor = '#00BFFF';

export type BaseGlobalLoaderProps<Style> = Partial<LoaderProps> & {
	/**
	 * Changes default color
	 */
	color?: string
	/**
	 * Styles for the Loader container
	 */
	style?: Style
}

export type GlobalLoadingProps = {
	color: string
} 

export let globalLoading: React.ReactNode = <GlobalLoading color={globalColor} />

export function setGlobalLoading(_globalLoading: React.ReactNode) {
	globalLoading = _globalLoading

	return globalLoading;
}

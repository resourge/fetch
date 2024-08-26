/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { createNewUrlWithSearch, parseParams, useSearchParams as useRSearchParams } from '@resourge/react-search-params'

import { type ParamsType } from '../../types/ParamsType';

import { type SearchParamsResult, type SearchParamsProps } from './types'

export const useSearchParams = <
	FilterSearchParams extends Record<string, any> = Record<string, any>,
>(
	{
		filter, 
		pagination,
		sort,
		hash
	}: SearchParamsProps<FilterSearchParams>
): SearchParamsResult<FilterSearchParams> => {
	const [
		{ params, url }, 
		setParams
	] = useRSearchParams<ParamsType<FilterSearchParams>>(
		({ url }) => {
			window.history.replaceState(null, '', url.href); 
		},
		{
			defaultParams: {
				...filter, 
				...pagination,
				sort
			},
			hash
		}
	);

	return {
		params,
		setParams,
		getPaginationHref(page: number) {
			return createNewUrlWithSearch(
				url, 
				parseParams({
					...params,
					page
				}), 
				hash
			).href;
		}
	}
}

/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { createNewUrlWithSearch, parseParams, useSearchParams as useRSearchParams } from '@resourge/react-search-params';

import { type DefaultPaginationType, type FilterType } from '../../types/types';

export type SearchParamsResult<
	Filter extends Record<string, any> = Record<string, any>,
	
> = {
	getPaginationHref: (page: number) => string
	params: FilterType<Filter>
	setParams: (newParams: FilterType<Filter>) => void
}

export const useSearchParams = <
	Filter extends Record<string, any> = Record<string, any>,
>(
	{
		filter, 
		pagination,
		sort
	}: DefaultPaginationType<Filter>,
	hash?: boolean
): SearchParamsResult<Filter> => {
	const [
		{ params, url }, 
		setParams
	] = useRSearchParams<FilterType<Filter>>(
		({ url }) => {
			window.history.replaceState(null, '', url.href); 
		},
		{
			...filter, 
			...pagination,
			...sort
		} as FilterType<Filter>,
		{
			hash
		}
	);

	const getPaginationHref = (page: number) => {
		const newSearch: string = parseParams({
			...params,
			page
		});

		return createNewUrlWithSearch(url, newSearch, hash).href;
	}

	return {
		params,
		setParams,
		getPaginationHref
	} as const
}

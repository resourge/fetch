/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { createNewUrlWithSearch, parseParams, useSearchParams as useRSearchParams } from '@resourge/react-search-params';

import { type DefaultPaginationType, type FilterType } from '../../types/types';

export type SearchParamsResult<
	Filter extends Record<string, any> = Record<string, any>,
	OrderColumn = string
> = {
	getPaginationHref: (page: number) => string
	params: FilterType<OrderColumn, Filter>
	setParams: (newParams: FilterType<OrderColumn, Filter>) => void
}

export const useSearchParams = <
	Filter extends Record<string, any> = Record<string, any>,
	OrderColumn = string
>(
	{
		filter, 
		pagination,
		sort
	}: DefaultPaginationType<Filter, OrderColumn>,
	hash?: boolean
): SearchParamsResult<Filter, OrderColumn> => {
	const [
		{ params, url }, 
		setParams
	] = useRSearchParams<FilterType<OrderColumn, Filter>>(
		({ url }) => {
			window.history.replaceState(null, '', url.href); 
		},
		{
			...filter, 
			...pagination,
			...sort
		} as FilterType<OrderColumn, Filter>,
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

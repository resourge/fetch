import { useMemo } from 'react';

import {
	type SortCriteria,
	type DefaultPaginationType,
	type FilterType,
	type OrderByEnum
} from '../types/types'

import { type SearchParamsResult, useSearchParams } from './useSearchParams/useSearchParams';

export type UseFilterSearchParamsReturn<Filter extends Record<string, any>, OrderColumn = string> = {
	filter: Filter
	/**
	 * Method to updates filters.
	 */
	setFilter: (newFilter: FilterType<OrderColumn, Filter>) => void
	/**
	 * Changes which column to order asc/desc.
	 */
	sortTable: (
		orderBy: OrderByEnum, 
		orderColumn: OrderColumn
	) => void
	sort?: SortCriteria<OrderColumn>
}

export const useFilterSearchParams = <
	Filter extends Record<string, any> = Record<string, any>,
	OrderColumn = string
>(
	defaultData: DefaultPaginationType<Filter, OrderColumn>,
	hash?: boolean
): UseFilterSearchParamsReturn<Filter, OrderColumn> & SearchParamsResult<Filter, OrderColumn> => {
	const {
		getPaginationHref,
		params,
		setParams
	} = useSearchParams<Filter, OrderColumn>(
		defaultData,
		hash
	);

	const {
		perPage,
		page, 

		orderBy,
		orderColumn,
		..._filter
	} = params;

	// This is to memorize filter and only change when search('?*') change.
	// eslint-disable-next-line react-hooks/exhaustive-deps 
	const filter = useMemo(() => _filter as unknown as Filter, [params]);

	const sort = useMemo(() => orderBy && orderColumn ? {
		orderBy,
		orderColumn
	} : undefined, [orderBy, orderColumn]);

	const setFilter = (newFilter: FilterType<OrderColumn, Filter>) => {
		setParams({
			...params,
			...newFilter
		})
	};

	const sortTable = (
		orderBy: OrderByEnum, 
		orderColumn: OrderColumn
	) => {
		setParams({
			...params,
			orderBy,
			orderColumn
		});
	};

	return {
		filter,
		sort,
		setFilter,
		sortTable,
		getPaginationHref,
		params,
		setParams
	}
}

import { useMemo } from 'react';

import {
	type SortCriteria,
	type DefaultPaginationType,
	type FilterType,
	type OrderByEnum
} from '../types/types'

import { type SearchParamsResult, useSearchParams } from './useSearchParams/useSearchParams';

type SortTable = {
	(sort: SortCriteria): void
	(
		orderBy: OrderByEnum, 
		orderColumn: string
	): void
}

export type FilterSearchParamsReturn<Filter extends Record<string, any>> = {
	filter: Filter
	/**
	 * Method to updates filters.
	 */
	setFilter: (newFilter: FilterType<Filter>) => void
	/**
	 * Changes which column to order asc/desc.
	 */
	sortTable: SortTable
	sort?: SortCriteria
}

export const useFilterSearchParams = <
	Filter extends Record<string, any> = Record<string, any>,
>(
	defaultData: DefaultPaginationType<Filter>,
	hash?: boolean
): FilterSearchParamsReturn<Filter> & SearchParamsResult<Filter> => {
	const {
		getPaginationHref,
		params,
		setParams
	} = useSearchParams<Filter>(
		defaultData,
		hash
	);

	// This is to memorize filter and only change when search('?*') change.
	// eslint-disable-next-line react-hooks/exhaustive-deps 
	const filter = useMemo(() => {
		const {
			perPage,
			page, 

			sort,
			..._filter
		} = params;
		return _filter as unknown as Filter
	}, [params]);

	const setFilter = (newFilter: FilterType<Filter>) => {
		setParams({
			...params,
			...newFilter
		})
	};

	const sortTable = (
		orderBy: OrderByEnum | SortCriteria, 
		orderColumn: string
	) => {
		if ( Array.isArray(orderBy) ) {
			setParams({
				...params,
				sort: orderBy
			});
			return;
		}
		const sort = params.sort ?? [];

		const index = sort.findIndex((val) => val.orderColumn === orderColumn);

		if ( index > -1 ) {
			sort[index] = {
				orderBy,
				orderColumn
			}
		}
		else {
			sort.push({
				orderBy,
				orderColumn
			})
		}

		setParams({
			...params,
			sort
		});
	};

	return {
		filter,
		sort: params.sort,
		setFilter,
		sortTable: sortTable as SortTable,
		getPaginationHref,
		params,
		setParams
	}
}

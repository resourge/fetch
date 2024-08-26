import { useMemo } from 'react';

import {
	type OrderByEnum,
	type PaginationSearchParamsType,
	type ParamsType,
	type SortCriteria,
	type SortSearchParamsType
} from '../types/ParamsType';
import { deepCompare } from '../utils/comparationUtils';

import { type Pagination } from './usePagination';
import { useRefMemo } from './useRefMemo';
import { type SearchParamsProps, type SearchParamsResult } from './useSearchParams/types';
import { useSearchParams } from './useSearchParams/useSearchParams';

export type FilterSearchParamsDefaultValue<T extends Record<string, any>> = {
	filter: T
	pagination: PaginationSearchParamsType
} & SortSearchParamsType

export type State<T extends Record<string, any>> = {
	filter: T
	pagination: Pagination
} & SortSearchParamsType

type SortTableFunctionType = {
	(sort: SortCriteria): void
	(
		orderBy: OrderByEnum, 
		orderColumn: string
	): void
}

export type FilterSearchParamsReturn<FilterSearchParams extends Record<string, any>> = {
	filter: FilterSearchParams
	pagination: Pagination
} & SortSearchParamsType 
& {
	/**
	 * Method to updates filters.
	 */
	setFilter: <F extends Record<string, any> = FilterSearchParams>(newFilter: ParamsType<F>) => void
	/**
	 * Changes which column to order asc/desc.
	 */
	sortTable: SortTableFunctionType
}

export const useFilterSearchParams = <
	FilterSearchParams extends Record<string, any> = Record<string, any>,
>(
	defaultData: SearchParamsProps<FilterSearchParams>
): FilterSearchParamsReturn<FilterSearchParams> & Pick<SearchParamsResult<FilterSearchParams>, 'getPaginationHref'> => {
	const {
		getPaginationHref,
		params,
		setParams
	} = useSearchParams<FilterSearchParams>(defaultData);

	const memoRef = useRefMemo<State<FilterSearchParams>>(() => ({
		filter: defaultData.filter,
		sort: defaultData.sort,
		pagination: {
			page: defaultData.pagination.page,
			perPage: defaultData.pagination.perPage,
			totalItems: 0,
			totalPages: 0
		}
	}))

	const {
		filter,
		sort,
		pagination
	} = useMemo(() => {
		const {
			perPage,
			page, 

			sort,
			...filter
		} = params;

		if ( 
			perPage !== undefined &&
			memoRef.current.pagination.perPage !== perPage
		) {
			memoRef.current.pagination.perPage = perPage;
		}

		if ( 
			page !== undefined &&
			memoRef.current.pagination.page !== page
		) {
			memoRef.current.pagination.page = page;
		}

		if ( !deepCompare(sort, memoRef.current.sort) ) {
			memoRef.current.sort = sort;
		}

		if ( !deepCompare(filter as unknown as FilterSearchParams, memoRef.current.filter) ) {
			memoRef.current.filter = filter as unknown as FilterSearchParams;
		}

		return memoRef.current
	// eslint-disable-next-line react-hooks/exhaustive-deps 
	}, [params]);

	const setFilter = <F extends Record<string, any> = FilterSearchParams>(newFilter: ParamsType<F>) => {
		setParams({
			...filter,
			sort,
			page: pagination.page,
			perPage: pagination.perPage,
			...newFilter
		})
	};

	const sortTable = (
		orderBy: OrderByEnum | SortCriteria, 
		orderColumn: string
	) => {
		if ( Array.isArray(orderBy) ) {
			setFilter({
				page: 0,
				sort: orderBy
			});
			return;
		}
		const sort = params.sort ? [...params.sort] : [];

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

		setFilter({
			page: 0,
			sort
		});
	};

	return {
		pagination,
		filter,
		sort,
		setFilter,
		sortTable: sortTable as SortTableFunctionType,
		getPaginationHref
	}
}

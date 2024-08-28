import { type MutableRefObject, useEffect } from 'react';

import {
	createNewUrlWithSearch,
	parseParams,
	parseSearchParams,
	HistoryStore
} from '@resourge/history-store'

import {
	type OrderByEnum,
	type PaginationSearchParamsType,
	type ParamsType,
	type SortCriteria,
	type SortSearchParamsType
} from '../types/ParamsType';
import { deepCompare } from '../utils/comparationUtils';

import { type Pagination } from './usePagination';
import { type PreloadRef } from './usePreload';
import { useRefMemo } from './useRefMemo';

export type FilterSearchParamsDefaultValue<T extends Record<string, any>> = {
	filter: T
	pagination: PaginationSearchParamsType
} & SortSearchParamsType

export type SearchParamsMetadata<FilterSearchParams extends Record<string, any>> = {
	filter: FilterSearchParams
	pagination: Pagination
} & SortSearchParamsType

export type State<FilterSearchParams extends Record<string, any>> = {
	metadata: SearchParamsMetadata<FilterSearchParams>
	params: ParamsType<FilterSearchParams>
}

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

export type FilterSearchParamsProps<
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>
> = {
		
	fetch: (metadata: SearchParamsMetadata<FilterSearchParams>) => Promise<Data>
	filter: FilterSearchParams
	preloadRef: MutableRefObject<PreloadRef<Data>>
	hash?: boolean
} & SortSearchParamsType
& PaginationSearchParamsType

export const useFilterSearchParams = <
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>,
>(
	{
		filter,
		page,
		perPage,
		sort,
		fetch,
		preloadRef,
		hash
	}: FilterSearchParamsProps<Data, FilterSearchParams>
): FilterSearchParamsReturn<FilterSearchParams> => {
	function getDataFromParams() {
		const [url] = HistoryStore.getValue()

		let searchParams = url.searchParams;
		if (hash) {
			const hashUrl = new URL(
				url.hash.substring(1, url.hash.length),
				window.location.origin
			);
			searchParams = hashUrl.searchParams;
		}

		const params = parseSearchParams<ParamsType<FilterSearchParams>>(
			searchParams, 
			{
				...filter, 
				page,
				perPage,
				sort
			}
		);

		return ({
			metadata: {
				filter: params.filter ?? filter,
				sort: params.sort ?? sort,
				pagination: {
					page: params.page ?? page,
					perPage: params.perPage ?? perPage,
					totalItems: 0,
					totalPages: 0
				}
			},
			params
		});
	}

	const memoRef = useRefMemo<State<FilterSearchParams>>(getDataFromParams)

	const setFilter = <F extends Record<string, any> = FilterSearchParams>(newFilter: ParamsType<F>) => {
		const [url] = HistoryStore.getValue()
		
		const newSearch = parseParams({
			...memoRef.current.metadata.filter,
			sort: memoRef.current.metadata.sort,
			page: memoRef.current.metadata.pagination.page,
			perPage: memoRef.current.metadata.pagination.perPage,
			...newFilter
		});

		if ( url.search !== newSearch ) {
			const newURL = createNewUrlWithSearch(
				url,
				newSearch,
				hash
			);

			HistoryStore.navigate(
				newURL, 
				{
					replace: true 
				}
			)
		}
	};

	const sortTable = (
		orderBy: OrderByEnum | SortCriteria, 
		orderColumn: string
	) => {
		if ( Array.isArray(orderBy) ) {
			setFilter({
				page,
				sort: orderBy
			});
			return;
		}
		const _sort = memoRef.current.metadata.sort ? [...memoRef.current.metadata.sort] : [];

		const index = _sort.findIndex((val) => val.orderColumn === orderColumn);

		if ( index > -1 ) {
			_sort[index] = {
				orderBy,
				orderColumn
			}
		}
		else {
			_sort.push({
				orderBy,
				orderColumn
			})
		}

		setFilter({
			page,
			sort: _sort
		});
	};

	useEffect(() => {
		return HistoryStore.subscribe(() => {
			const {
				metadata: {
					filter,
					pagination: {
						page,
						perPage
					},
					sort
				},
				params
			} = getDataFromParams();

			memoRef.current.params = params;
			
			if ( 
				perPage !== undefined && memoRef.current.metadata.pagination.perPage !== perPage
			) {
				preloadRef.current = {};
				memoRef.current.metadata.pagination.perPage = perPage;
			}

			if ( 
				page !== undefined && memoRef.current.metadata.pagination.page !== page
			) {
				memoRef.current.metadata.pagination.page = page;
			}

			if ( !deepCompare(sort, memoRef.current.metadata.sort) ) {
				preloadRef.current = {};
				memoRef.current.metadata.sort = sort;
			}

			if ( !deepCompare(filter as unknown as FilterSearchParams, memoRef.current.metadata.filter) ) {
				preloadRef.current = {};
				memoRef.current.metadata.filter = filter as unknown as FilterSearchParams;
			}

			fetch(memoRef.current.metadata);
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		pagination: memoRef.current.metadata.pagination,
		filter: memoRef.current.metadata.filter,
		sort: memoRef.current.metadata.sort,
		setFilter,
		sortTable: sortTable as SortTableFunctionType
	}
}

/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type MutableRefObject, useEffect, useMemo } from 'react'

import { HistoryStore } from '@resourge/history-store';
import { createNewUrlWithSearch, parseParams, parseSearchParams } from '@resourge/history-store/utils';

import {
	type OrderByEnum,
	type PaginationSearchParamsType,
	type ParamsType,
	type SortCriteria,
	type SortSearchParamsType
} from '../types/ParamsType';
import { deepCompare } from '../utils/comparationUtils';
import { type FilterKeysState } from '../utils/createProxy';

import { filterByCacheIds, removeCacheIds, useMultipleFiltersId } from './useMultipleFiltersId';
import { type Pagination } from './usePagination';
import { type PreloadRef } from './usePreload';

export type FilterSearchParamsDefaultValue<T extends Record<string, any>> = {
	filter: T
	pagination: PaginationSearchParamsType
} & SortSearchParamsType

export type SearchParamsMetadata<FilterSearchParams extends Record<string, any>> = {
	filter: FilterSearchParams
	pagination: Pagination
} & SortSearchParamsType

export type State<FilterSearchParams extends Record<string, any>> = SearchParamsMetadata<FilterSearchParams>

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
	 * Method to update params.
	 */
	setParams: <F extends Record<string, any> = FilterSearchParams>(newFilter: ParamsType<F>) => void
	/**
	 * Changes which column to order asc/desc.
	 */
	sortTable: SortTableFunctionType
}

export type FilterSearchParamsProps<
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>
> = {
	defaultFilter: FilterSearchParams
	deps: readonly any[]
	fetch: (metadata: SearchParamsMetadata<FilterSearchParams>, whatChanged: Set<'pagination' | 'sort' | 'filter'>) => Promise<Data>
	filterKeysRef: React.MutableRefObject<FilterKeysState>
	initialPage: PaginationSearchParamsType['page']
	initialPerPage: PaginationSearchParamsType['perPage']
	preloadRef: MutableRefObject<PreloadRef<Data>>
	defaultSort?: SortSearchParamsType['sort']
	hash?: boolean
}

export const useFilterSearchParams = <
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>,
>(
	{
		defaultFilter,
		initialPage,
		initialPerPage,
		defaultSort,
		fetch,
		preloadRef,
		hash,
		deps,
		filterKeysRef
	}: FilterSearchParamsProps<Data, FilterSearchParams>
): FilterSearchParamsReturn<FilterSearchParams> => {
	const fId = useMultipleFiltersId({
		hash 
	});

	function getParams(url: URL) {
		let searchParams = url.searchParams;
		if (hash) {
			const hashUrl = new URL(
				url.hash.slice(1),
				window.location.origin
			);
			searchParams = hashUrl.searchParams;
		}

		return parseSearchParams<ParamsType<FilterSearchParams>>(
			searchParams, 
			{
				...defaultFilter, 
				page: initialPage,
				perPage: initialPerPage,
				sort: defaultSort
			}
		);
	}
	
	function getDataFromParams() {
		const [url] = HistoryStore.getValue()

		const params = getParams(url);
		const {
			sort,
			page,
			perPage,
			...filter
		} = fId ? ((params[fId] ?? {}) as ParamsType<FilterSearchParams>) : params

		return ({
			filter: removeCacheIds(filter) ?? defaultFilter,
			sort: sort ?? defaultSort,
			pagination: {
				page: page ?? initialPage,
				perPage: perPage ?? initialPerPage,
				totalItems: 0,
				totalPages: 0
			}
		}) as State<FilterSearchParams>;
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const data = useMemo(getDataFromParams, deps);

	const setParams = <F extends Record<string, any> = FilterSearchParams>(newFilter: ParamsType<F>) => {
		const [url] = HistoryStore.getValue()
		const params = filterByCacheIds(
			fId,
			getParams(url)
		);

		const newSearch = parseParams({
			...params,
			...fId ? ({
				[fId]: newFilter 
			}) : newFilter
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

	const setFilter = <F extends Record<string, any> = FilterSearchParams>(newFilter: ParamsType<F>) => {
		setParams<F>({
			...data.filter,
			sort: data.sort,
			page: data.pagination.page,
			perPage: data.pagination.perPage,
			...newFilter
		});
	};

	const sortTable = (
		orderBy: OrderByEnum | SortCriteria, 
		orderColumn: string
	) => {
		if ( Array.isArray(orderBy) ) {
			setFilter({
				page: initialPage,
				sort: orderBy
			});
			return;
		}
		const sort = data.sort ? [...data.sort] : [];

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
			page: initialPage,
			sort
		});
	};

	useEffect(() => {
		return HistoryStore.subscribe(() => {
			const {
				filter,
				pagination: {
					page,
					perPage
				},
				sort
			} = getDataFromParams();

			const whatChanged = new Set<'pagination' | 'sort' | 'filter'>();
			
			if ( 
				perPage !== undefined && data.pagination.perPage !== perPage
			) {
				preloadRef.current = {};
				whatChanged.add('pagination');
				data.pagination.perPage = perPage;
			}

			if ( 
				page !== undefined && data.pagination.page !== page
			) {
				whatChanged.add('pagination');
				data.pagination.page = page;
			}

			if ( !deepCompare(sort, data.sort) ) {
				whatChanged.add('sort');
				preloadRef.current = {};
				data.sort = sort;
			}

			if ( 
				!deepCompare(
					filter, 
					data.filter, 
					filterKeysRef.current
				) 
			) {
				whatChanged.add('filter');
				preloadRef.current = {};
				data.filter = filter;
			}

			if ( whatChanged.size ) {
				fetch(data, whatChanged);
			}
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		pagination: data.pagination,
		filter: data.filter,
		sort: data.sort,
		setParams,
		setFilter,
		sortTable: sortTable as SortTableFunctionType
	}
}

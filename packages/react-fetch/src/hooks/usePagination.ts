/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { useRef } from 'react';

import { HistoryStore } from '@resourge/history-store';
import { createNewUrlWithSearch, parseParams } from '@resourge/history-store/utils';

import { type PaginationConfig, type ResetPaginationMetadataType } from '../types/PaginationConfig';
import { type PaginationFunctionsType, type PaginationMethod } from '../types/PaginationFunctionsType';
import { type PaginationSearchParamsType, type ParamsType } from '../types/ParamsType';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../utils/constants';
import { createProxy, type FilterKeysState } from '../utils/createProxy';
import { calculateTotalPages } from '../utils/utils';

import { useFetch } from './useFetch';
import { useFilterSearchParams, type FilterSearchParamsReturn, type SearchParamsMetadata } from './useFilterSearchParams';
import { usePreload } from './usePreload';

export type Pagination = PaginationSearchParamsType & { totalItems: number, totalPages: number }

export type PaginationReturn<
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>,
> = Omit<FilterSearchParamsReturn<FilterSearchParams>, 'setParams'>
& PaginationFunctionsType<Data, FilterSearchParams>
& {
	/**
	 * Changes current page
	 */
	changePage: (page: number, totalItems?: number) => void
	/**
	 * Changes both current page and items per page
	 */
	changePagination: (page: number, perPage: number) => void
	/**
	 * Changes total number of pages using total number of items
	 * * Note: It doesn't trigger render.
	 */
	changeTotalPages: (totalItems: number) => void
	/**
	 * Builds href for use on navigation. (usually used with pagination component)
	 */
	getPaginationHref: (page: number) => string
	pagination: Pagination
	/**
	 * Resets pagination to initial/default values
	 */
	resetPagination: () => void
} 

export const usePagination = <Data extends any[], FilterSearchParams extends Record<string, any> = Record<string, any>>(
	method: PaginationMethod<Data, FilterSearchParams>,
	{ 
		initialState,
		filter: defaultFilter = {} as FilterSearchParams,
		sort: defaultSort,
		hash,
		deps = [],
		initialPage = DEFAULT_PAGE,
		initialPerPage = DEFAULT_PER_PAGE,
		preload,
		fId,
		...config
	}: PaginationConfig<Data, FilterSearchParams>
): PaginationReturn<Data, FilterSearchParams> => {
	const { getMethod, preloadRef } = usePreload<Data, FilterSearchParams>({
		method,
		preload,
		initialPage,
		deps
	});

	const filterKeysRef = useRef<FilterKeysState>({
		keys: new Set() 
	});

	const fetchData = useFetch(
		async (
			metadata: SearchParamsMetadata<FilterSearchParams> = {
				pagination,
				filter,
				sort
			}
		) => {
			const { data, totalItems } = await getMethod(
				createProxy(
					metadata, 
					filterKeysRef.current
				)
			);

			changeTotalPages(totalItems ?? 0);

			return data
		},
		{
			initialState,
			...config,
			deps
		}
	)

	const {
		pagination,
		filter,
		sort,

		setFilter,
		sortTable,
		setParams
	} = useFilterSearchParams<Data, FilterSearchParams>({
		fetch: fetchData.fetch,
		preloadRef,
		defaultFilter,
		defaultSort,
		initialPage,
		initialPerPage,
		hash,
		deps,
		fId,
		filterKeysRef
	});
	
	function getPaginationHref(page: number) {
		const [url] = HistoryStore.getValue()
		return createNewUrlWithSearch(
			url, 
			parseParams({
				page,
				perPage: pagination.perPage,
				sort,
				...filter
			}), 
			hash
		).href;
	}

	const changePage = (page: number, perPage: number = pagination.perPage) => {
		setFilter({
			page,
			perPage
		});
	};

	const changeTotalPages = (totalItems: number) => {
		const totalPages = calculateTotalPages(pagination.perPage, totalItems);

		pagination.totalItems = totalItems;
		pagination.totalPages = totalPages;

		if ( totalPages < pagination.page ) {
			changePage(initialPage)
		}
	}

	const reset = ({
		filter,
		pagination = {},
		sort = []
	}: ResetPaginationMetadataType<FilterSearchParams> = {}) => {
		setParams({
			page: pagination.page ?? initialPage,
			perPage: pagination.perPage ?? initialPerPage,
			sort: sort ?? defaultSort,

			...defaultFilter,
			...filter
		} as ParamsType<FilterSearchParams>);
	}

	return {
		data: fetchData.data,
		get error() {
			return fetchData.error
		},
		get isLoading() {
			return fetchData.isLoading
		},

		setPaginationState: fetchData.setFetchState,
		fetch: () => {
			preloadRef.current = {};
			return fetchData.fetch();
		},

		sort,
		filter,

		pagination,
		changeTotalPages,
		changePage,
		changeItemsPerPage(perPage: number) {
			changePage(initialPage, perPage)
		},
		changePagination(page: number, perPage: number) {
			changePage(page, perPage);
		},
		resetPagination() {
			changePage(initialPage, initialPerPage)
		},
		getPaginationHref,

		setFilter,
		sortTable,

		reset
	}
}

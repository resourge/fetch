/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useMemo, useRef } from 'react';

import {
	type DeepPartial,
	type DefaultPaginationType,
	type FilterType,
	type PaginationMetadata,
	type PaginationSearchParams
} from '../types/types';
import { calculateTotalPages } from '../utils/utils';

import { useFetch, type FetchState, type FetchStateConfig } from './useFetch';
import { useFilterSearchParams, type FilterSearchParamsReturn } from './useFilterSearchParams';
import { type PreloadConfig, usePreload } from './usePreload';

export type Pagination = PaginationSearchParams & { totalItems: number, totalPages: number }

export type PaginationConfig<
	Data,
	Filter extends Record<string, any> = Record<string, any>,
> = DefaultPaginationType<Filter>
& FetchStateConfig<Data> 
& {
	hash?: boolean
	/**
	 * Initial page starts with 0, but can be overwrite.
	 * @default 0
	 */
	initialPage?: number
	/**
	 * Max number of items per page
	 */
	maxPerPage?: number
	preload?: PreloadConfig
}

export type PaginationReturn<
	Data,
	Filter extends Record<string, any> = Record<string, any>,
> = FilterSearchParamsReturn<Filter> & {
	/**
	 * Changes items per page
	 */
	changeItemsPerPage: (perPage: number) => void
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
	 * useFetchPagination Data
	 */
	data: Data
	error: FetchState<any, any>['error']

	/** 
	 * Redoes the fetch again.
	*/
	fetch: () => Promise<Data>
	/**
	 * Builds href for use on navigation. (usually used with pagination component)
	 */
	getPaginationHref: (page: number) => string
	isLoading: FetchState<any, any>['isLoading']
	pagination: Pagination
	/**
	 * Resets the pagination, sort and/or filter.
	 */
	reset: (newSearchParams?: DeepPartial<PaginationMetadata<Filter>>) => void
	/**
	 * Resets pagination to initial/default values
	 */
	resetPagination: () => void

	setPaginationState: FetchState<any, any>['setFetchState']
} 

export const usePagination = <Data extends any[], Filter extends Record<string, any> = Record<string, any>>(
	method: (
		metadata: PaginationMetadata<Filter>
	) => Promise<{ data: Data, totalItems?: number }>,
	{ 
		initialState,
		filter: defaultFilter,
		sort: defaultSort,
		hash = false,
		deps = [],
		initialPage = 0,
		pagination: defaultPagination = { },
		preload,
		maxPerPage,
		...config
	}: PaginationConfig<Data, Filter>
): PaginationReturn<Data, Filter> => {
	const defaultPerPage = defaultPagination.perPage ?? 10;
	const defaultPage = defaultPagination.page ?? initialPage;

	const {
		params,
		filter,
		sort,

		getPaginationHref,
		setParams,
		setFilter,
		sortTable
	} = useFilterSearchParams<Filter>(
		{
			filter: defaultFilter,
			sort: defaultSort,
			pagination: defaultPagination
		},
		hash
	);

	const {
		perPage,
		page 
	} = params;

	const paginationRef = useRef({
		totalPages: 0,
		totalItems: 0 
	});

	const pagination = useMemo((): Pagination => ({
		perPage: perPage ?? defaultPerPage,
		page: page ?? defaultPage,
		get totalPages() {
			return paginationRef.current.totalPages
		},
		get totalItems() {
			return paginationRef.current.totalItems
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}), [perPage, page])

	const { getMethod } = usePreload<Data, Filter>({
		method,
		preload,
		filter,
		initialPage,
		page: pagination.page,
		maxPerPage,
		sort
	});

	const _setParams = (newPagination: Partial<PaginationSearchParams>) => {
		setParams({
			...params,
			...newPagination
		})
	}

	const changePage = (page: number) => {
		_setParams({
			page
		});
	};

	const changeTotalPages = (totalItems: number) => {
		const totalPages = calculateTotalPages(pagination.perPage, totalItems);

		paginationRef.current = {
			totalPages: totalPages ?? pagination.totalPages,
			totalItems
		}

		if ( totalPages < pagination.page ) {
			changePage(initialPage)
		}
	}

	const changeItemsPerPage = (perPage: number) => {
		_setParams({
			perPage,
			page: initialPage
		});
	};
    
	const changePagination = (page: number, perPage: number) => {
		_setParams({
			perPage,
			page
		});
	};

	const resetPagination = () => {
		_setParams({
			page: initialPage,
			perPage
		});
	};

	const fetchData = useFetch(
		async () => {
			const { data, totalItems } = await getMethod({
				pagination,
				sort,
				filter
			});

			changeTotalPages(totalItems ?? 0);

			return data
		},
		{
			initialState,
			...config,
			deps: deps ? [pagination, filter, sort, ...deps] : [pagination, filter, sort]
		}
	)

	const reset = ({
		filter,
		pagination = {},
		sort = []
	}: DeepPartial<PaginationMetadata<Filter>> = {}) => {
		setParams({
			page: pagination.page ?? defaultPage,
			perPage: pagination.perPage ?? defaultPerPage,
			sort,

			...defaultFilter,
			...filter
		} as FilterType<Filter>);
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
		fetch: fetchData.fetch,

		sort,
		filter,

		pagination,
		changeTotalPages,
		changePage,
		changeItemsPerPage,
		changePagination,
		resetPagination,
		getPaginationHref,

		setFilter,
		sortTable,

		reset
	}
}

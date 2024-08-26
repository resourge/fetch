/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { type PaginationConfig, type ResetPaginationMetadataType } from '../types/PaginationConfig';
import { type PaginationFunctionsType, type PaginationMethod } from '../types/PaginationFunctionsType';
import { type PaginationSearchParamsType, type ParamsType } from '../types/ParamsType';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../utils/constants';
import { calculateTotalPages } from '../utils/utils';

import { useFetch } from './useFetch';
import { useFilterSearchParams, type FilterSearchParamsReturn } from './useFilterSearchParams';
import { usePreload } from './usePreload';

export type Pagination = PaginationSearchParamsType & { totalItems: number, totalPages: number }

export type PaginationReturn<
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>,
> = FilterSearchParamsReturn<FilterSearchParams>
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
		...config
	}: PaginationConfig<Data, FilterSearchParams>
): PaginationReturn<Data, FilterSearchParams> => {
	const {
		pagination,
		filter,
		sort,

		getPaginationHref,
		setFilter,
		sortTable
	} = useFilterSearchParams<FilterSearchParams>({
		filter: defaultFilter,
		sort: defaultSort,
		pagination: {
			page: initialPage,
			perPage: initialPerPage
		},
		hash
	});

	const { getMethod, preloadRef } = usePreload<Data, FilterSearchParams>({
		method,
		preload,
		initialPage,

		filter,
		pagination,
		sort
	});

	const fetchData = useFetch(
		async () => {
			const { data, totalItems } = await getMethod({
				filter,
				pagination,
				sort
			});

			changeTotalPages(totalItems ?? 0);
			return data
		},
		{
			initialState,
			...config,
			deps: deps.length
				? [pagination.page, pagination.perPage, filter, sort, ...deps] 
				: [pagination.page, pagination.perPage, filter, sort]
		}
	)

	const changeItemsPerPage = (perPage: number) => {
		setFilter({
			perPage,
			page: initialPage
		});
	};

	const changePage = (page: number) => {
		setFilter({
			page
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
    
	const changePagination = (page: number, perPage: number) => {
		setFilter({
			perPage,
			page
		});
	};

	const resetPagination = () => {
		setFilter({
			page: initialPage,
			perPage: initialPerPage
		});
	};

	const reset = ({
		filter,
		pagination = {},
		sort = []
	}: ResetPaginationMetadataType<FilterSearchParams> = {}) => {
		setFilter({
			page: pagination.page ?? initialPage,
			perPage: pagination.perPage ?? initialPerPage,
			sort,

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
		changeItemsPerPage,
		changePagination,
		resetPagination,
		getPaginationHref,

		setFilter,
		sortTable,

		reset
	}
}

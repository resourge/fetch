/* eslint-disable react-hooks/immutability */
import { useRef } from 'react';

import { type FilterParamsReturn, type Pagination, type SearchParamsMetadata } from '../types/FilterParamsTypes';
import { type PaginationConfig, type ResetPaginationMetadataType } from '../types/PaginationConfig';
import { type PaginationFunctionsType, type PaginationMethod } from '../types/PaginationFunctionsType';
import { type ParamsType } from '../types/ParamsType';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../utils/constants';
import { createProxy, type FilterKeysState } from '../utils/createProxy';
import { calculateTotalPages } from '../utils/utils';

import { useFetch } from './useFetch';
import { useFilterParams } from './useFilterParams';
import { usePreload } from './usePreload';

export type PaginationReturn<
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>
> = Omit<FilterParamsReturn<FilterSearchParams>, 'setParams'> & PaginationFunctionsType<Data, FilterSearchParams> & {
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
};

export const usePagination = <Data extends any[], FilterSearchParams extends Record<string, any> = Record<string, any>>(
	method: PaginationMethod<Data, FilterSearchParams>,
	{
		deps = [],
		enable,
		fId,
		filter: defaultFilter = {} as FilterSearchParams,
		hash,
		initialPage = DEFAULT_PAGE,
		initialPerPage = DEFAULT_PER_PAGE,
		initialState,
		paramsMode,
		preload,
		sort: defaultSort,
		...config
	}: PaginationConfig<Data, FilterSearchParams>
): PaginationReturn<Data, FilterSearchParams> => {
	const { getMethod, preloadRef } = usePreload<Data, FilterSearchParams>({
		deps,
		initialPage,
		method,
		preload
	});

	const filterKeysRef = useRef<FilterKeysState>({
		keys: new Set()
	});

	const fetchData = useFetch(
		async (
			// eslint-disable-next-line unicorn/no-object-as-default-parameter
			metadata: SearchParamsMetadata<FilterSearchParams> = {
				filter,
				pagination,
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

			return data;
		},
		{
			initialState,
			...config,
			deps,
			enable
		}
	);

	const {
		filter,
		getPaginationHref,
		pagination,

		setFilter,
		setParams,
		sort,
		sortTable
	} = useFilterParams<Data, FilterSearchParams>({
		defaultFilter,
		defaultSort,
		deps,
		enable,
		fetch: fetchData.fetch,
		fId,
		filterKeysRef,
		hash,
		initialPage,
		initialPerPage,
		paramsMode,
		preloadRef
	});

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

		if (totalPages < pagination.page) {
			changePage(initialPage);
		}
	};

	const reset = ({
		filter,
		pagination = {},
		sort
	}: ResetPaginationMetadataType<FilterSearchParams> = {}) => {
		setParams({
			f: {
				...defaultFilter,
				...filter
			},
			page: pagination.page ?? initialPage,
			perPage: pagination.perPage ?? initialPerPage,

			sort: sort ?? defaultSort
		} as ParamsType<FilterSearchParams>);
	};

	return {
		changeItemsPerPage(perPage: number) {
			changePage(initialPage, perPage);
		},
		changePage,
		changePagination(page: number, perPage: number) {
			changePage(page, perPage);
		},

		changeTotalPages,
		get data() {
			return fetchData.data;
		},

		get error() {
			return fetchData.error;
		},
		fetch: () => {
			preloadRef.current = {};
			return fetchData.fetch();
		},

		filter,
		getPaginationHref,
		get isLoading() {
			return fetchData.isLoading;
		},
		pagination,
		reset,
		resetPagination() {
			changePage(initialPage, initialPerPage);
		},
		setFilter,

		setPaginationState: fetchData.setFetchState,
		sort,

		sortTable
	};
};

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useEffect, useRef } from 'react';

import { type UseFetchError } from '../services/NotificationService';
import {
	type DefaultPaginationType,
	type FilterType,
	type PaginationMetadata,
	type PaginationSearchParams
} from '../types/types';
import { calculateTotalPages } from '../utils/utils';

import { type FetchState } from './useFetch';
import { useFilterSearchParams, type FilterSearchParamsReturn } from './useFilterSearchParams'
import { type PreloadConfig, usePreload } from './usePreload';
import { type InfiniteScrollRestoration } from './useScrollRestoration/useInfiniteScrollRestoration';

import { useFetch, useIsOnline, type FetchStateConfig } from '.';

export type InfiniteLoadingConfig<
	Data,
	Filter extends Record<string, any> = Record<string, any>,
> = DefaultPaginationType<Filter> &
FetchStateConfig<Data> & {
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
};

export type InfiniteLoadingReturn<
	Data extends any[],
	Filter extends Record<string, any> = Record<string, any>,
> = FilterSearchParamsReturn<Filter> & {
	/**
	 * Changes items per page
	 */
	changeItemsPerPage: (perPage: number) => void
	readonly context: InfiniteLoadingReturn<Data, Filter>
	data: Data
	error: UseFetchError
	/**
	 * Fetch current pagination
	 */
	fetch: () => Promise<Data>
	/**
	 * If is last "page"
	 */
	isLast: boolean
	/**
	 * If last page is incomplete (itemPerPage 10 but the last page got less than 10)
	 */
	isLastIncomplete: boolean
	isLoading: FetchState<any, any>['isLoading']
	loadMore: () => Promise<void>
	/**
	 * Preload method.
	 */
	preload: () => void
	/**
	 * Resets the pagination, sort and/or filter.
	 */
	reset: (newSearchParams?: Partial<PaginationMetadata<Filter>>) => void

	setPaginationState: FetchState<any, any>['setFetchState']
};

type InternalDataRef<Data extends any[]> = {
	data: Data[]
	isFirstTime: boolean
	isLast: boolean
	isLastIncomplete: boolean
	isLoading: boolean
};

export const useInfiniteLoading = <
	Data extends any[],
	Filter extends Record<string, any> = Record<string, any>,
>(
	method: (
		metadata: PaginationMetadata<Filter>
	) => Promise<{ data: Data, totalItems?: number }>,
	{
		initialState,
		initialPage = 0,
		pagination: defaultPagination = {},
		filter: defaultFilter,
		sort: defaultSort,
		scrollRestoration,
		hash,
		preload,
		maxPerPage,
		...config
	}: InfiniteLoadingConfig<Data, Filter>
): InfiniteLoadingReturn<Data, Filter> => {
	const defaultPerPage = defaultPagination.perPage ?? 10;
	const defaultPage = defaultPagination.page ?? initialPage;

	const isOnline = useIsOnline();

	const _scrollRestoration: InfiniteScrollRestoration =
		scrollRestoration as InfiniteScrollRestoration;

	if (process.env.NODE_ENV === 'development') {
		if (_scrollRestoration && !_scrollRestoration.getPage) {
			throw new Error(
				"'scrollRestoration' needs to come from 'useInfiniteScrollRestoration'. 'scrollRestoration' from 'useScrollRestoration' doesn't work"
			);
		}
	}

	const paginationRef = useRef<{
		pagination: PaginationSearchParams
		totalItems: number
		totalPages: number
	}>({
		pagination: {
			perPage: defaultPerPage,
			page: defaultPage
		},
		totalPages: 0,
		totalItems: 0
	});

	const internalDataRef = useRef<InternalDataRef<Data>>({
		isFirstTime: true,
		isLoading: false,
		data: [],
		isLast: false,
		isLastIncomplete: false
	});

	const {
		setParams, filter, setFilter, sort, sortTable 
	} = useFilterSearchParams<Filter>(
		{
			filter: defaultFilter,
			sort: defaultSort
		},
		hash
	);

	const deps = config?.deps ? [filter, sort, ...config.deps] : [filter, sort];

	const {
		willPreload, getMethod, getRestoreMethod 
	} = usePreload<Data, Filter>({
		method,
		preload,
		filter,
		initialPage,
		page: paginationRef.current.pagination.page,
		maxPerPage,
		sort
	});

	async function _getRestoreMethod(metadata: PaginationMetadata<Filter>, restoration: PaginationSearchParams) { 
		const { totalItems } = await getRestoreMethod(
			metadata, 
			{
				page: restoration.page,
				perPage: restoration.perPage 
			},
			(index, data) => {
				internalDataRef.current.data[index] = data.splice(index, restoration.perPage) as Data;
			}
		);

		return {
			page: restoration.page,
			totalItems
		};
	}

	async function _getMethod(metadata: PaginationMetadata<Filter>) {
		if ( internalDataRef.current.isFirstTime && _scrollRestoration ) {
			const scrollRestorationData = _scrollRestoration.getPage();

			if ( 
				scrollRestorationData.perPage !== undefined &&
				scrollRestorationData.page !== undefined 
			) {
				return await _getRestoreMethod(
					metadata, 
					{
						page: scrollRestorationData.page,
						perPage: scrollRestorationData.perPage 
					}
				);
			}
		}

		const { data, totalItems } = await getMethod(
			metadata
		);

		internalDataRef.current.data[metadata.pagination.page] = data;

		return {
			page: metadata.pagination.page,
			totalItems
		};
	}

	const fetchData = useFetch(
		async () => {
			internalDataRef.current.isLoading = true;
			const { page, totalItems } = await _getMethod({
				pagination: paginationRef.current.pagination,
				sort,
				filter
			})

			internalDataRef.current.isFirstTime = false;

			changeTotalPages(totalItems ?? 0);
			
			// If outside dependencies change reset infiniteLoading page
			paginationRef.current.pagination.page = page;

			const newData = internalDataRef.current.data.flat() as Data;

			if (_scrollRestoration) {
				_scrollRestoration.setPage(
					paginationRef.current.pagination.page,
					paginationRef.current.pagination.perPage
				);
			}

			const inComplete = newData.length !== (
				paginationRef.current.pagination.page + 1
			) * paginationRef.current.pagination.perPage

			internalDataRef.current.isLast = newData.length === totalItems;

			internalDataRef.current.isLastIncomplete = internalDataRef.current.isLast && inComplete;

			internalDataRef.current.isLoading = false;

			return newData;
		},
		{
			initialState,
			...config,
			scrollRestoration,
			deps
		}
	);

	useEffect(() => {
		internalDataRef.current.data = [];
		paginationRef.current.pagination.page = initialPage;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOnline, ...deps]);

	const changeItemsPerPage = (perPage: number) => {
		paginationRef.current.pagination.perPage = perPage;
		paginationRef.current.pagination.page = initialPage;
		internalDataRef.current.data = [];

		fetchData.fetch();
	};

	const changePage = (page: number) => {
		paginationRef.current.pagination.page = page;

		fetchData.fetch();
	};

	const changeTotalPages = (totalItems: number) => {
		const totalPages = calculateTotalPages(
			paginationRef.current.pagination.perPage,
			totalItems
		);
		paginationRef.current.totalPages = totalPages ?? paginationRef.current.totalPages;
		paginationRef.current.totalItems = totalItems;
		if (totalPages < paginationRef.current.pagination.page) {
			changePage(initialPage);
		}
	};

	const reset = ({
		filter,
		pagination,
		sort
	}: Partial<PaginationMetadata<Filter>> = {}) => {
		paginationRef.current.pagination = {
			perPage: pagination?.perPage ?? defaultPerPage,
			page: pagination?.perPage ?? defaultPage
		};

		setParams({
			sort: sort ?? defaultSort,

			...defaultFilter,
			...filter
		} as FilterType<Filter>);
	};

	return {
		preload: () => {
			getMethod({
				filter,
				sort,
				pagination: {
					...paginationRef.current.pagination,
					page: paginationRef.current.pagination.page + 1
				}
			})
		},
		isLast: internalDataRef.current.isLast,
		isLastIncomplete: internalDataRef.current.isLastIncomplete,
		loadMore: async () => {
			if ( internalDataRef.current.isLoading ) {
				return;
			}

			if ( internalDataRef.current.isLastIncomplete ) {
				if ( willPreload(paginationRef.current.pagination.page) ) {
					return;
				}
				const { totalItems } = await _getRestoreMethod(
					{
						pagination: paginationRef.current.pagination,
						sort,
						filter
					}, 
					{
						page: paginationRef.current.pagination.page,
						perPage: paginationRef.current.pagination.perPage 
					}
				);

				changeTotalPages(totalItems ?? 0);

				fetchData.setFetchState(internalDataRef.current.data.flat() as Data);

				return;
			}
			changePage(paginationRef.current.pagination.page + 1);
		},

		data: fetchData.data,
		get error() {
			return fetchData.error;
		},
		get isLoading() {
			return fetchData.isLoading;
		},

		setPaginationState: fetchData.setFetchState,
		fetch: fetchData.fetch,

		sort,
		filter,

		changeItemsPerPage,

		setFilter,
		sortTable,

		reset,

		get context() {
			return this;
		},
		// @ts-expect-error To prevent circular dependency
		toJSON() {
			return {
				...this,
				get context() {
					return 'To Prevent circular dependency';
				}
			};
		}
	};
};

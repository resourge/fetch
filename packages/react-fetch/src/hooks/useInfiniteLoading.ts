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
import { useFilterSearchParams, type FilterSearchParamsReturn } from './useFilterSearchParams';
import { type InfiniteScrollRestoration } from './useScrollRestoration/useInfiniteScrollRestoration';

import { useFetch, useIsOnline, type FetchStateConfig } from '.';

export type InfiniteLoadingConfig<
	Data,
	Filter extends Record<string, any> = Record<string, any>,
> = DefaultPaginationType<Filter>
& FetchStateConfig<Data> 
& {
	hash?: boolean
}

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
	loadMore: () => void
	/** 
	 * Preload method.
	*/
	preload: () => void
	/**
	 * Resets the pagination, sort and/or filter.
	 */
	reset: (newSearchParams?: Partial<PaginationMetadata<Filter>>) => void

	setPaginationState: FetchState<any, any>['setFetchState']
}

const MINUTE_IN_MILLISECOND = 60000

type InternalDataRef<Data extends any[]> = {
	data: Data[]
	isFirstTime: boolean
	nextData: {
		method?: () => Promise<{
			data: Data
			totalItems?: number | undefined
		}>
		promise?: Promise<{
			data: Data
			totalItems?: number | undefined
		}>
		when?: Date
	}
	perPage: number
}

export const useInfiniteLoading = <
	Data extends any[],
	Filter extends Record<string, any> = Record<string, any>
>(
	method: (
		metadata: PaginationMetadata<Filter>
	) => Promise<{ data: Data, totalItems?: number }>,
	{ 
		initialState,
		pagination: defaultPagination = {
			page: 0,
			perPage: 10
		},
		filter: defaultFilter,
		sort: defaultSort,
		scrollRestoration,
		hash,
		...config 
	}: InfiniteLoadingConfig<Data, Filter>
): InfiniteLoadingReturn<Data, Filter> => {
	const isOnline = useIsOnline();

	const _scrollRestoration: InfiniteScrollRestoration = scrollRestoration as InfiniteScrollRestoration;
	
	if ( process.env.NODE_ENV === 'development' ) {
		if ( _scrollRestoration && !_scrollRestoration.getPage ) {
			throw new Error('\'scrollRestoration\' needs to come from \'useInfiniteScrollRestoration\'. \'scrollRestoration\' from \'useScrollRestoration\' doesn\'t work')
		}
	}

	const paginationRef = useRef<{
		pagination: PaginationSearchParams
		totalItems: number
		totalPages: number
	}>({
		pagination: defaultPagination,
		totalPages: 0,
		totalItems: 0
	});
	const internalDataRef = useRef<InternalDataRef<Data>>({
		isFirstTime: true,
		data: [],
		nextData: { },
		perPage: defaultPagination.perPage 
	});

	const {
		setParams,
		filter,
		setFilter,
		sort,
		sortTable
	} = useFilterSearchParams<Filter>(
		{
			filter: defaultFilter,
			sort: defaultSort
		},
		hash
	);

	const deps = config?.deps ? [filter, sort, ...config.deps] : [filter, sort];
	
	const fetchData = useFetch(
		async () => {
			const scrollRestorationData = internalDataRef.current.isFirstTime && _scrollRestoration 
				? _scrollRestoration.getPage() 
				: undefined;
			internalDataRef.current.isFirstTime = false;

			const perPage = scrollRestorationData && scrollRestorationData.perPage !== undefined && scrollRestorationData.page !== undefined 
				? (scrollRestorationData.perPage * (scrollRestorationData.page + 1))
				: paginationRef.current.pagination.perPage;
			const page = scrollRestorationData 
				? 0 
				: paginationRef.current.pagination.page;
				
			paginationRef.current.pagination.page = scrollRestorationData?.page ?? paginationRef.current.pagination.page;

			const tableMeta = {
				pagination: {
					page,
					perPage 
				},
				sort,
				filter
			};

			const { data, totalItems } = await (
				// Finish "nextData" in case "nextData" has yet to finish
				internalDataRef.current.nextData.promise &&
				internalDataRef.current.nextData.when && 
				Date.now() - internalDataRef.current.nextData.when.getTime() <= MINUTE_IN_MILLISECOND
					? internalDataRef.current.nextData.promise
					// Normal get
					: method(tableMeta)
			);

			internalDataRef.current.data[tableMeta.pagination.page] = data;

			// If outside dependencies change reset infiniteLoading page
			paginationRef.current.pagination.page = tableMeta.pagination.page;
			changeTotalPages(totalItems ?? 0);

			// Preload next "page"
			const newData = internalDataRef.current.data.flat() as Data;
			internalDataRef.current.nextData = {};
			if ( 
				totalItems && 
				totalItems > tableMeta.pagination.perPage && 
				!(newData.length !== ((paginationRef.current.pagination.page + 1) * paginationRef.current.pagination.perPage))
			) { 
				internalDataRef.current.nextData.method = () => method({
					pagination: {
						page: tableMeta.pagination.page + 1,
						perPage: tableMeta.pagination.perPage
					},
					filter: tableMeta.filter,
					sort: tableMeta.sort
				});
			}

			if ( _scrollRestoration ) {
				_scrollRestoration.setPage(paginationRef.current.pagination.page, paginationRef.current.pagination.perPage);
			}

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
		internalDataRef.current.nextData = {};
		paginationRef.current.pagination.page = 0;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOnline, ...(deps ?? [])])

	const changeItemsPerPage = (perPage: number) => {
		paginationRef.current.pagination.perPage = perPage;
		paginationRef.current.pagination.page = 0;
		internalDataRef.current.data = [];

		fetchData.fetch();
	};

	const changePage = (page: number) => {
		paginationRef.current.pagination.page = page;

		fetchData.fetch();
	};

	const changeTotalPages = (totalItems: number) => {
		const totalPages = calculateTotalPages(paginationRef.current.pagination.perPage, totalItems);
		paginationRef.current.totalPages = totalPages ?? paginationRef.current.totalPages;
		paginationRef.current.totalItems = totalItems;
		if (totalPages < paginationRef.current.pagination.page) {
			changePage(0);
		}
	};

	const preload = () => {
		if ( internalDataRef.current.nextData.method ) {
			if (
				!internalDataRef.current.nextData.when || (
					internalDataRef.current.nextData.when && 
					Date.now() - internalDataRef.current.nextData.when.getTime() > MINUTE_IN_MILLISECOND
				)
			) {
				internalDataRef.current.nextData.promise = internalDataRef.current.nextData.method();
				internalDataRef.current.nextData.when = new Date();
			}
		}
	};

	const isLastIncomplete = internalDataRef.current.isFirstTime ? false : (fetchData.data.length !== ((paginationRef.current.pagination.page + 1) * paginationRef.current.pagination.perPage));

	const loadMore = () => {
		if ( isLastIncomplete ) {
			fetchData.fetch();
			return;
		}
		changePage(paginationRef.current.pagination.page + 1);
	};

	const reset = ({
		filter,
		pagination,
		sort
	}: Partial<PaginationMetadata<Filter>> = {}) => {
		paginationRef.current.pagination = {
			...(pagination ?? defaultPagination) 
		};

		setParams({
			sort: sort ?? defaultSort,

			...defaultFilter,
			...filter
		} as FilterType<Filter>);
	}

	const _context: InfiniteLoadingReturn<Data, Filter> = {
		preload,
		isLast: paginationRef.current.pagination.page >= (paginationRef.current.totalPages - 1),
		isLastIncomplete,
		loadMore,

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

		changeItemsPerPage,

		setFilter,
		sortTable,

		reset,

		get context() {
			return _context;
		}
	};

	return _context;
};

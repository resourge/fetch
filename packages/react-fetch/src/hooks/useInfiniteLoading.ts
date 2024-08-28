/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useEffect, useRef } from 'react';

import { type PaginationMetadata } from '../types';
import { type PaginationConfig, type ResetPaginationMetadataType } from '../types/PaginationConfig';
import { type PaginationFunctionsType, type PaginationMethod } from '../types/PaginationFunctionsType';
import { type PaginationSearchParamsType } from '../types/ParamsType';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../utils/constants';
import { calculateTotalPages } from '../utils/utils';

import { useFetch } from './useFetch';
import { type SearchParamsMetadata, useFilterSearchParams, type FilterSearchParamsReturn } from './useFilterSearchParams';
import { useIsOnline } from './useIsOnline';
import { usePreload } from './usePreload';
import { type InfiniteScrollRestoration } from './useScrollRestoration/useInfiniteScrollRestoration';

export type InfiniteLoadingReturn<
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>,
> = FilterSearchParamsReturn<FilterSearchParams> 
& PaginationFunctionsType<Data, FilterSearchParams>
& {
	readonly context: InfiniteLoadingReturn<Data, FilterSearchParams>
	/**
	 * If is last "page"
	 */
	isLast: boolean
	/**
	 * If last page is incomplete (itemPerPage 10 but the last page got less than 10)
	 */
	isLastIncomplete: boolean
	loadMore: () => Promise<void>
	/**
	 * Preload method.
	 */
	preload: () => void
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
	FilterSearchParams extends Record<string, any> = Record<string, any>,
>(
	method: PaginationMethod<Data, FilterSearchParams>,
	{
		initialState,
		filter: defaultFilter = {} as FilterSearchParams,
		sort: defaultSort,
		hash,
		deps = [],
		initialPage = DEFAULT_PAGE,
		initialPerPage = DEFAULT_PER_PAGE,
		scrollRestoration,
		preload,
		...config
	}: PaginationConfig<Data, FilterSearchParams>
): InfiniteLoadingReturn<Data, FilterSearchParams> => {
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

	const internalDataRef = useRef<InternalDataRef<Data>>({
		isFirstTime: true,
		isLoading: false,
		data: [],
		isLast: false,
		isLastIncomplete: false
	});

	const {
		willPreload, getMethod, getRestoreMethod, preloadRef
	} = usePreload<Data, FilterSearchParams>({
		method,
		preload,
		initialPage,
		deps
	});

	async function _getRestoreMethod(metadata: PaginationMetadata<FilterSearchParams>, restoration: PaginationSearchParamsType) { 
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

	async function _getMethod(metadata: PaginationMetadata<FilterSearchParams>) {
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
		async (
			metadata: SearchParamsMetadata<FilterSearchParams> = {
				pagination,
				filter,
				sort
			}
		) => {
			internalDataRef.current.isLoading = true;
			const { page, totalItems } = await _getMethod(metadata)

			internalDataRef.current.isFirstTime = false;

			changeTotalPages(totalItems ?? 0);
			
			// If outside dependencies change reset infiniteLoading page
			pagination.page = page;

			const newData = internalDataRef.current.data.flat() as Data;

			if (_scrollRestoration) {
				_scrollRestoration.setPage(
					pagination.page,
					pagination.perPage
				);
			}

			const inInComplete = newData.length !== (
				(internalDataRef.current.data.length)
			) * pagination.perPage

			internalDataRef.current.isLast = newData.length === totalItems;

			internalDataRef.current.isLastIncomplete = internalDataRef.current.isLast && inInComplete;

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

	const {
		filter, setFilter, sort, sortTable, pagination
	} = useFilterSearchParams<Data, FilterSearchParams>({
		fetch: fetchData.fetch,
		preloadRef,
		filter: defaultFilter,
		sort: defaultSort,
		page: initialPage,
		perPage: initialPerPage,
		hash
	});

	useEffect(() => {
		internalDataRef.current.data = [];
		pagination.page = initialPage;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOnline, ...deps]);

	const changeItemsPerPage = (perPage: number) => {
		pagination.perPage = perPage;
		pagination.page = initialPage;
		internalDataRef.current.data = [];

		fetchData.fetch();
	};

	const changePage = (page: number) => {
		pagination.page = page;

		fetchData.fetch();
	};

	const changeTotalPages = (totalItems: number) => {
		const totalPages = calculateTotalPages(pagination.perPage, totalItems);

		pagination.totalPages = totalPages ?? pagination.totalPages;
		pagination.totalItems = totalItems;
		
		if (totalPages < pagination.page) {
			changePage(initialPage);
		}
	};

	const reset = (value: ResetPaginationMetadataType<FilterSearchParams> = {}) => {
		pagination.perPage = value.pagination?.perPage ?? initialPerPage;
		pagination.page = value.pagination?.perPage ?? initialPage;

		setFilter({
			sort,

			...defaultFilter,
			...filter
		});
	};

	return {
		preload: () => {
			getMethod({
				filter,
				sort,
				pagination: {
					...pagination,
					page: pagination.page + 1
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
				if ( willPreload(pagination.page) ) {
					return;
				}
				const { totalItems } = await _getRestoreMethod(
					{
						pagination,
						sort,
						filter
					}, 
					{
						page: pagination.page,
						perPage: pagination.perPage 
					}
				);

				changeTotalPages(totalItems ?? 0);

				fetchData.setFetchState(internalDataRef.current.data.flat() as Data);

				return;
			}
			changePage(pagination.page + 1);
		},

		data: fetchData.data,
		get error() {
			return fetchData.error;
		},
		get isLoading() {
			return fetchData.isLoading;
		},

		setPaginationState: fetchData.setFetchState,
		fetch: () => {
			preloadRef.current = {};
			return fetchData.fetch();
		},

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

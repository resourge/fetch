/* eslint-disable react-hooks/immutability */
import { useEffect, useRef } from 'react';

import { type PaginationMetadata } from '../types';
import { type FilterParamsReturn, type SearchParamsMetadata } from '../types/FilterParamsTypes';
import { type PaginationConfig, type ResetPaginationMetadataType } from '../types/PaginationConfig';
import { type PaginationFunctionsType, type PaginationMethod } from '../types/PaginationFunctionsType';
import { type PaginationSearchParamsType, type ParamsType } from '../types/ParamsType';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../utils/constants';
import { createProxy, type FilterKeysState } from '../utils/createProxy';
import { calculateTotalPages } from '../utils/utils';

import { useFetch } from './useFetch';
import { useFilterParams } from './useFilterParams';
import { useIsOnline } from './useIsOnline';
import { usePreload } from './usePreload';
import { type InfiniteScrollRestoration } from './useScrollRestoration/useInfiniteScrollRestoration';

type InternalDataRef<Data extends any[]> = {
	canLoadMore: boolean
	data: Data[]
	isFirstTime: boolean
	isLast: boolean
	isLoading: boolean
};

export type InfiniteLoadingReturn<
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>
> = FilterParamsReturn<FilterSearchParams> & PaginationFunctionsType<Data, FilterSearchParams> & {
	/**
	 * If can load more pages
	 */
	canLoadMore: boolean
	readonly context: InfiniteLoadingReturn<Data, FilterSearchParams>
	/**
	 * If is last "page"
	 */
	isLast: boolean
	loadMore: () => Promise<void>
	/**
	 * Preload method.
	 */
	preload: () => void
};

export const useInfiniteLoading = <
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>
>(
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
		scrollRestoration,
		sort: defaultSort,
		...config
	}: PaginationConfig<Data, FilterSearchParams>
): InfiniteLoadingReturn<Data, FilterSearchParams> => {
	const isOnline = useIsOnline();

	const _scrollRestoration: InfiniteScrollRestoration = scrollRestoration as InfiniteScrollRestoration;

	if (process.env.NODE_ENV === 'development' && _scrollRestoration && !_scrollRestoration.getPage) {
		throw new Error('\'scrollRestoration\' needs to come from \'useInfiniteScrollRestoration\'. \'scrollRestoration\' from \'useScrollRestoration\' doesn\'t work');
	}

	const internalDataRef = useRef<InternalDataRef<Data>>({
		canLoadMore: false,
		data: [],
		isFirstTime: true,
		isLast: false,
		isLoading: false
	});

	const {
		getMethod, getRestoreMethod, preloadRef, willPreload
	} = usePreload<Data, FilterSearchParams>({
		deps,
		initialPage,
		method,
		preload
	});

	async function fetchRestoredData(metadata: PaginationMetadata<FilterSearchParams>, restoration: PaginationSearchParamsType) {
		const { totalItems } = await getRestoreMethod(
			metadata,
			{
				page: restoration.page,
				perPage: restoration.perPage
			},
			(index, data) => {
				internalDataRef.current.data[index] = data;
			}
		);

		return {
			page: restoration.page,
			totalItems
		};
	}

	async function fetchDataMethod(metadata: PaginationMetadata<FilterSearchParams>) {
		if (internalDataRef.current.isFirstTime && _scrollRestoration) {
			const scrollRestorationData = _scrollRestoration.getPage();

			if (
				scrollRestorationData
				&& scrollRestorationData.perPage !== undefined
				&& scrollRestorationData.page !== undefined
			) {
				return await fetchRestoredData(
					metadata,
					{
						page: scrollRestorationData.page,
						perPage: scrollRestorationData.perPage
					}
				);
			}
		}

		const { data, totalItems } = await getMethod(metadata);

		internalDataRef.current.data[metadata.pagination.page] = data;

		return {
			page: metadata.pagination.page,
			totalItems
		};
	}

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
			},
			whatChanged
		) => {
			if (
				whatChanged
				&& whatChanged.size > 0
				&& !(whatChanged.size === 1 && whatChanged.has('pagination'))
			) {
				internalDataRef.current.data = [];
			}
			internalDataRef.current.isLoading = true;
			const { page, totalItems } = await fetchDataMethod(
				createProxy(
					metadata,
					filterKeysRef.current
				)
			);

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

			const isAFullPage = ((newData.length / pagination.perPage) % 1) === 0;

			internalDataRef.current.isLast = newData.length >= (totalItems ?? 0);

			internalDataRef.current.canLoadMore = !internalDataRef.current.isLast && Boolean(isAFullPage);

			internalDataRef.current.isLoading = false;

			return newData;
		},
		{
			initialState,
			...config,
			deps,
			enable,
			scrollRestoration
		}
	);

	const {
		filter,
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

	useEffect(() => {
		internalDataRef.current.data = [];
		pagination.page = initialPage;
	}, [isOnline, ...deps]);

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

	return {
		canLoadMore: internalDataRef.current.canLoadMore,
		changeItemsPerPage: (perPage: number) => {
			pagination.perPage = perPage;
			pagination.page = initialPage;
			internalDataRef.current.data = [];

			fetchData.fetch();
		},
		get context() {
			return this;
		},
		get data() {
			return fetchData.data;
		},

		get error() {
			return fetchData.error;
		},
		fetch: () => {
			internalDataRef.current.isFirstTime = true;
			internalDataRef.current.data = [];
			preloadRef.current = {};
			return fetchData.fetch();
		},
		filter,

		isLast: internalDataRef.current.isLast,
		get isLoading() {
			return fetchData.isLoading;
		},

		loadMore: async () => {
			if (enable === false || internalDataRef.current.isLoading) {
				return;
			}

			if (internalDataRef.current.canLoadMore) {
				changePage(pagination.page + 1);
				return;
			}

			if (willPreload(pagination.page)) {
				return;
			}

			const { totalItems } = await fetchRestoredData(
				{
					filter,
					pagination,
					sort
				},
				pagination
			);

			changeTotalPages(totalItems ?? 0);

			fetchData.setFetchState(internalDataRef.current.data.flat() as Data);
		},
		pagination,
		preload: () => {
			if (enable === false) {
				return;
			}
			getMethod({
				filter,
				pagination: {
					...pagination,
					page: pagination.page + 1
				},
				sort
			});
		},

		reset: (value: ResetPaginationMetadataType<FilterSearchParams> = {}) => {
			pagination.perPage = value.pagination?.perPage ?? initialPerPage;
			pagination.page = value.pagination?.perPage ?? initialPage;

			setParams({
				f: {
					...defaultFilter,
					...value.filter
				},
				sort: value.sort ?? defaultSort
			} as ParamsType<FilterSearchParams>);
		},

		setFilter,
		setPaginationState: fetchData.setFetchState,

		sort,

		sortTable,
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

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

import { useEffectEvent } from './useEffectEvent';
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

export type State<FilterSearchParams extends Record<string, any>> = SearchParamsMetadata<FilterSearchParams> & {
	url: URL
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
	setFilter: <F extends Record<string, any> = FilterSearchParams>(newFilter: Omit<ParamsType<F>, 'f'> & Partial<F>) => void
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
	enable?: boolean
	/**
	 * Optional unique identifier to namespace multiple filter states in the URL.
	 * 
	 * When two or more instances of useFilterSearchParams are used in the same page,
	 * this ID helps prevent conflicts by grouping related search parameters together.
	 * If not provided, a unique ID will be automatically generated.
	 */
	fId?: string
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
		filterKeysRef,
		fId,
		enable
	}: FilterSearchParamsProps<Data, FilterSearchParams>
): FilterSearchParamsReturn<FilterSearchParams> => {
	const _fetch = useEffectEvent(fetch);

	function getParams(url: URL) {
		let searchParams = url.searchParams;
		if (hash) {
			const hashUrl = new URL(
				url.hash.slice(1),
				window.location.origin
			);
			searchParams = hashUrl.searchParams;
		}

		return parseSearchParams<ParamsType<FilterSearchParams> & Record<string, any>>(
			searchParams, 
			{
				f: defaultFilter, 
				page: initialPage,
				perPage: initialPerPage,
				sort: defaultSort
			}
		);
	}
	
	function getDataFromParams(): State<FilterSearchParams> {
		const [url] = HistoryStore.getValue()

		const params = getParams(url);
		const {
			sort = defaultSort,
			page = initialPage,
			perPage = initialPerPage,
			f: filter = defaultFilter
		} = (fId ? (params[fId] ?? {}) : params)

		return {
			filter,
			sort,
			pagination: {
				page,
				perPage,
				totalItems: 0,
				totalPages: 0
			},
			url
		};
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const data = useMemo(getDataFromParams, deps);

	const setParams = <F extends Record<string, any> = FilterSearchParams>(newFilter: ParamsType<F>) => {
		const [url] = HistoryStore.getValue()
		const params = getParams(url);

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

	const setFilter = ({
		page = initialPage,
		perPage = data.pagination.perPage,
		sort = data.sort,
		...filter
	}: ParamsType<FilterSearchParams>) => {
		setParams<FilterSearchParams>({
			sort,
			page,
			perPage,
			f: {
				...data.filter,
				...filter
			}
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
		if ( enable === false ) {
			return;
		}
		
		return HistoryStore.subscribe(() => {
			const {
				filter,
				pagination: {
					page,
					perPage
				},
				sort,
				url: subscribeURL
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
					filterKeysRef.current.state
				) 
			) {
				whatChanged.add('filter');
				preloadRef.current = {};
				data.filter = filter;
			}

			if ( whatChanged.size ) {
				if ( hash ) {
					const newRenderURL = new URL(
						data.url.hash.slice(1), 
						window.location.origin
					);
					const newSubscribeURL = new URL(
						subscribeURL.hash.slice(1), 
						window.location.origin
					);
					if ( newRenderURL.hash !== newSubscribeURL.hash ) {
						return;
					}
				}
				else if ( data.url.pathname !== subscribeURL.pathname ) {
					return;
				}
				_fetch(data, whatChanged);
			}
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, enable]);

	return {
		pagination: data.pagination,
		filter: data.filter,
		sort: data.sort,
		setParams,
		setFilter,
		sortTable: sortTable as SortTableFunctionType
	}
}

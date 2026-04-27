import { type RefObject } from 'react';

import { type PreloadRef } from '../hooks/usePreload';
import { type FilterKeysState } from '../utils/createProxy';

import {
	type OrderByEnum,
	type PaginationSearchParamsType,
	type ParamsType,
	type SortCriteria,
	type SortSearchParamsType
} from './ParamsType';

export type FilterParamsProps<
	Data,
	FilterParams extends Record<string, any> = Record<string, any>
> = {
	defaultFilter: FilterParams
	defaultSort?: SortSearchParamsType['sort']
	deps: readonly any[]
	enable?: boolean
	fetch: (metadata: SearchParamsMetadata<FilterParams>, whatChanged: Set<'filter' | 'pagination' | 'sort'>) => Promise<Data>
	/**
	 * Optional unique identifier to namespace multiple filter states in the URL.
	 * 
	 * When two or more instances of useFilterSearchParams are used in the same page,
	 * this ID helps prevent conflicts by grouping related search parameters together.
	 * If not provided, a unique ID will be automatically generated.
	 */
	fId?: string
	filterKeysRef: RefObject<FilterKeysState>
	hash?: boolean
	initialPage: PaginationSearchParamsType['page']
	initialPerPage: PaginationSearchParamsType['perPage']
	/**
	 * Controls where filter/sort/pagination state is stored.
	 *
	 * - `'url'` (default): State is synced with the URL search parameters via `HistoryStore`.
	 *   `fId`, `hash`, and `getPaginationHref` work as expected.
	 * - `'state'`: State is kept in React memory only. The URL is never read or written.
	 *   `fId`, `hash`, and `getPaginationHref` are not applicable in this mode.
	 *
	 * @default 'url'
	 */
	paramsMode?: 'state' | 'url'

	preloadRef: RefObject<PreloadRef<Data>>
};

export type FilterParamsReturn<FilterParams extends Record<string, any>> = SortSearchParamsType & {
	/**
	 * Builds href for use on navigation. (usually used with pagination component)
	 */
	getPaginationHref: (page: number) => string
	/**
	 * Method to updates filters.
	 */
	setFilter: <F extends Record<string, any> = FilterParams>(newFilter: Omit<ParamsType<F>, 'f'> & Partial<F>) => void
	/**
	 * Method to update params.
	 */
	setParams: <F extends Record<string, any> = FilterParams>(newFilter: ParamsType<F>) => void
	/**
	 * Changes which column to order asc/desc.
	 */
	sortTable: SortTableFunctionType
} & {
	filter: FilterParams
	pagination: Pagination
};

export type Pagination = PaginationSearchParamsType & {
	totalItems: number
	totalPages: number
};

export type SearchParamsMetadata<FilterParams extends Record<string, any>> = SortSearchParamsType & {
	filter: FilterParams
	pagination: Pagination
};

export type SortTableFunctionType = {
	(sort: SortCriteria): void
	(
		orderBy: OrderByEnum,
		orderColumn: string
	): void
};

export type State<FilterParams extends Record<string, any>> = SearchParamsMetadata<FilterParams> & {
	url: URL
};

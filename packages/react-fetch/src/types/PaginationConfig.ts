import { type FetchStateConfig } from '../hooks';
import { type PreloadConfig } from '../hooks/usePreload';

import { type PaginationSearchParamsType, type SortSearchParamsType } from './ParamsType';
import { type DeepPartial } from './types';

export type PaginationConfig<
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>
> = FetchStateConfig<Data>
	& SortSearchParamsType
	& {
		/**
		 * Optional unique identifier to namespace multiple filter states in the URL.
		 * 
		 * When two or more instances of useInfiniteLoading and/or usePagination are used in the same page,
		 * this ID helps prevent conflicts by grouping related search parameters together.
		 * If not provided, a unique ID will be automatically generated.
		 */
		fId?: string
		hash?: boolean
		/**
		 * Initial page starts with 0, but can be overwrite.
		 * @default 0
		 */
		initialPage?: number
		/**
		 * Initial per page starts with 10, but can be overwrite.
		 * @default 10
		 */
		initialPerPage?: number

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
		preload?: PreloadConfig
	}
	& {
		filter?: FilterSearchParams
	};

export type PaginationMetadata<
	FilterSearchParams extends Record<string, any> = Record<string, any>
> = SortSearchParamsType & {
	filter: FilterSearchParams
	pagination: PaginationSearchParamsType
};

export type ResetPaginationMetadataType<
	FilterSearchParams extends Record<string, any> = Record<string, any>
> = DeepPartial<PaginationMetadata<FilterSearchParams>>;

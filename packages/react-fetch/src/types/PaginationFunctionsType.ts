import { type FetchState } from '../hooks/useFetch'
import { type UseFetchError } from '../services/NotificationService'

import { type PaginationMetadata, type ResetPaginationMetadataType } from './PaginationConfig'

export type PaginationMethod<
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>,
> = (
	metadata: PaginationMetadata<FilterSearchParams>
) => Promise<{ data: Data, totalItems?: number }>

export type PaginationFunctionsType<
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>,
> = {
	/**
	 * Changes items per page
	 */
	changeItemsPerPage: (perPage: number) => void
	data: Data
	error: UseFetchError
	/**
	 * Fetch current pagination
	 */
	fetch: () => Promise<Data>
	isLoading: boolean
	/**
	 * Resets the pagination, sort and/or filter.
	 */
	reset: (newSearchParams?: ResetPaginationMetadataType<FilterSearchParams>) => void

	setPaginationState: FetchState<Data, any>['setFetchState']
}

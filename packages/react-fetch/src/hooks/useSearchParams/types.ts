import { type PaginationSearchParamsType, type ParamsType, type SortSearchParamsType } from '../../types/ParamsType'

export type SearchParamsProps<
	FilterSearchParams extends Record<string, any> = Record<string, any>
> = SortSearchParamsType
& {
	filter: FilterSearchParams
	pagination: PaginationSearchParamsType
	hash?: boolean
} 

export type SearchParamsResult<
	FilterSearchParams extends Record<string, any> = Record<string, any>,
> = {
	getPaginationHref: (page: number) => string
	params: ParamsType<FilterSearchParams>
	setParams: (newParams: ParamsType<FilterSearchParams>) => void
}

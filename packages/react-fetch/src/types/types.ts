export enum OrderByEnum {
	ASC = 1,
	DESC = 2
}

export type SortCriteria = Array<{
	orderBy: OrderByEnum
	orderColumn: string
}>

export type SortType = {
	sort?: SortCriteria
}

export type PaginationSearchParams = { page: number, perPage: number }

export type FilterType<
	T extends Record<string, any>
> = Partial<PaginationSearchParams & T> & SortType

export type FilterSearchParamsDefaultValue<T extends Record<string, any>> = {
	filter?: T
} & SortType

export type DefaultPaginationType<
	Filter extends Record<string, any> = Record<string, any>
> = FilterSearchParamsDefaultValue<Filter> & {
	pagination?: PaginationSearchParams
} 

export type PaginationMetadata<
	Filter extends Record<string, any> = Record<string, any>
> = {
	filter: Filter
	pagination: PaginationSearchParams
} & SortType

export type DeepPartial<T> = T extends object ? {
	[P in keyof T]?: DeepPartial<T[P]>;
} : T;

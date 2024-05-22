export enum OrderByEnum {
	ASC = 1,
	DESC = 2
}

export type SortCriteria = {
	orderBy: OrderByEnum
	orderColumn: string
}

export type PaginationSearchParams = { page: number, perPage: number }

export type FilterType<
	T extends Record<string, any>
> = PaginationSearchParams & Partial<T & SortCriteria>

export type UseFilterSearchParamsDefaultValue<T extends Record<string, any>> = {
	filter?: T
	sort?: SortCriteria
}

export type DefaultPaginationType<
	Filter extends Record<string, any> = Record<string, any>
> = UseFilterSearchParamsDefaultValue<Filter> & {
	pagination?: PaginationSearchParams
} 

export type PaginationMetadata<
	Filter extends Record<string, any> = Record<string, any>
> = {
	filter: Filter
	pagination: PaginationSearchParams
	sort?: SortCriteria
}

export type DeepPartial<T> = T extends object ? {
	[P in keyof T]?: DeepPartial<T[P]>;
} : T;

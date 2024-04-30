export enum OrderByEnum {
	ASC = 1,
	DESC = 2
}

export type SortCriteria<T = string> = {
	orderBy: OrderByEnum
	orderColumn: T extends string ? string : keyof T
}

export type PaginationSearchParams = { page: number, perPage: number }

export type FilterType<
	OrderColumn, 
	T extends Record<string, any>
> = PaginationSearchParams & Partial<T & SortCriteria<OrderColumn>>

export type UseFilterSearchParamsDefaultValue<T extends Record<string, any>, OrderColumn = string> = {
	filter?: T
	sort?: SortCriteria<OrderColumn>
}

export type DefaultPaginationType<
	Filter extends Record<string, any> = Record<string, any>,
	OrderColumn = string
> = UseFilterSearchParamsDefaultValue<Filter, OrderColumn> & {
	pagination?: PaginationSearchParams
} 

export type PaginationMetadata<
	Filter extends Record<string, any> = Record<string, any>,
	OrderColumn = string, 
> = {
	filter: Filter
	pagination: PaginationSearchParams
	sort?: SortCriteria<OrderColumn>
}

export type DeepPartial<T> = T extends object ? {
	[P in keyof T]?: DeepPartial<T[P]>;
} : T;

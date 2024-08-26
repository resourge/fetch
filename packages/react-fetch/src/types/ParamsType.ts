export enum OrderByEnum {
	ASC = 1,
	DESC = 2
}

export type SortCriteria = Array<{
	orderBy: OrderByEnum
	orderColumn: string
}>

export type SortSearchParamsType = {
	sort?: SortCriteria
}

export type PaginationSearchParamsType = { 
	page: number
	perPage: number 
}

export type ParamsType<
	FilterSearchParams extends Record<string, any>
> = Partial<PaginationSearchParamsType> & Partial<FilterSearchParams> & SortSearchParamsType

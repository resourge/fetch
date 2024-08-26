import { useMemo, useRef } from 'react'

import { type PaginationMetadata } from '../types'
import { type PaginationSearchParamsType, type SortCriteria } from '../types/ParamsType'
import { IS_DEV } from '../utils/constants'
import { calculateTotalPages } from '../utils/utils'

import { type Pagination } from './usePagination'

export type PreloadConfig = false | {
	maxPerPage?: number
	next?: boolean
	previous?: boolean
	/**
	 * @default 60000 miliseconds (1minute)
	 */
	timeout?: number
}

export type PreloadMethodResult<Data extends any[]> = { data: Data, totalItems?: number }

export type PreloadProps<
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>,
> = {
	filter: FilterSearchParams
	initialPage: number
	method: (metadata: PaginationMetadata<FilterSearchParams>) => Promise<PreloadMethodResult<Data>>
	pagination: Pagination
	preload?: PreloadConfig
	sort?: SortCriteria
}

const ONE_MINUTE_IN_MILLISECOND = (1 * 60 * 1000);

export const usePreload = <
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>,
>(
	{
		method,
		preload = {},
		filter,
		sort,
		pagination,
		initialPage
	}: PreloadProps<Data, FilterSearchParams>
) => {
	if ( IS_DEV ) {
		if ( typeof preload === 'object' && preload.maxPerPage && !Number.isInteger(preload.maxPerPage) ) {
			throw new Error('`maxPerPage` needs to be integer');
		}
	}
		
	const preloadRef = useRef<
		Record<
			number, 
			{ 
				data: { data: Data, totalItems?: number }
				date: number 
			}
		>
	>({});

	function willPreload(page: number) {
		return (
			preload !== false && 
			preloadRef.current[page] &&
			Date.now() - preloadRef.current[page].date <= (preload.timeout ?? ONE_MINUTE_IN_MILLISECOND)
		)
	}

	async function _getMethod(metadata: PaginationMetadata<FilterSearchParams>): Promise<PreloadMethodResult<Data>> {
		const page = metadata.pagination.page;

		if ( willPreload(page) ) {
			return preloadRef.current[page].data;
		}

		const data = await method(metadata);

		preloadRef.current[page] = {
			date: Date.now(),
			data
		}

		return preloadRef.current[page].data;
	}

	function preloadMethod(metadata: PaginationMetadata<FilterSearchParams>, res: PreloadMethodResult<Data>) {
		if ( preload === false ) {
			return;
		}

		if ( preload.previous !== false ) {
			const previousPage = metadata.pagination.page - 1;

			if ( previousPage >= initialPage ) {
				_getMethod(
					{
						...metadata,
						pagination: {
							...metadata.pagination,
							page: previousPage 
						}
					}
				)
			}
		}

		if ( preload.next !== false ) {
			const nextPage = metadata.pagination.page + 1;
			const totalPages = calculateTotalPages(metadata.pagination.perPage, res.totalItems);
			if ( initialPage ? nextPage <= totalPages : nextPage < totalPages ) {
				_getMethod(
					{
						...metadata,
						pagination: {
							...metadata.pagination,
							page: nextPage 
						}
					}
				)
			}
		}
	}

	useMemo(() => {
		if ( pagination.page === initialPage ) {
			preloadRef.current = {};
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter, sort])

	async function getMethod(metadata: PaginationMetadata<FilterSearchParams>) {
		const res = await _getMethod(metadata);

		preloadMethod(metadata, res);

		return res;
	}

	async function getMultipleMethod(
		metadata: PaginationMetadata<FilterSearchParams>, 
		maxPerPage: number
	): Promise<PreloadMethodResult<Data>> {
		const results = await Promise.all(
			Array.from(
				{
					length: Math.ceil(metadata.pagination.perPage / maxPerPage)
				},
				(_, index) => _getMethod({
					...metadata,
					pagination: {
						...metadata.pagination,
						page: index,
						perPage: maxPerPage
					}
				})
			)
		)

		const totalItems = results[0].totalItems;
		const data = results.flatMap(({ data }) => data) as Data;

		return {
			totalItems,
			data
		}
	}

	async function getRestoreMethod(
		metadata: PaginationMetadata<FilterSearchParams>, 
		pagination: PaginationSearchParamsType,
		onData?: (index: number, data: Data) => void
	) {
		const _metadata = {
			...metadata,
			pagination: {
				...metadata.pagination,
				page: initialPage,
				perPage: pagination.perPage * (pagination.page + 1)
			}
		};

		preloadRef.current = {};

		const maxPerPage = typeof preload === 'object' ? preload.maxPerPage : undefined;

		const { data, totalItems } = await (
			!maxPerPage 
				? _getMethod(_metadata) 
				: getMultipleMethod(_metadata, maxPerPage)
		);

		const date = Date.now();

		let lastPage = initialPage;

		Array.from(
			{
				length: Math.ceil(data.length / metadata.pagination.perPage)
			},
			(_, index) => {
				const newIndex = index + initialPage;
				lastPage = newIndex;
				const newData = data.splice(index, metadata.pagination.perPage) as Data;
				onData && onData(newIndex, newData)

				preloadRef.current[index + initialPage] = {
					data: {
						data: newData,
						totalItems
					},
					date
				};
				return undefined;
			}
		)

		preloadMethod(
			{
				...metadata,
				pagination: {
					...metadata.pagination,
					page: lastPage
				}
			},
			{
				data,
				totalItems 
			}
		);

		return {
			totalItems 
		};
	}

	return {
		willPreload,
		getMethod,
		getRestoreMethod,
		preloadRef
	}
}

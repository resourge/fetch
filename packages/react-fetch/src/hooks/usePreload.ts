import { useMemo, useRef } from 'react'

import { type PaginationSearchParams, type PaginationMetadata, type SortCriteria } from '../types'
import { IS_DEV } from '../utils/constants'
import { calculateTotalPages } from '../utils/utils'

export type PreloadConfig = false | {
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
	Filter extends Record<string, any> = Record<string, any>,
> = {
	filter: Filter
	initialPage: number
	method: (metadata: PaginationMetadata<Filter>) => Promise<PreloadMethodResult<Data>>
	page: number
	maxPerPage?: number
	preload?: PreloadConfig
	sort?: SortCriteria
}

const ONE_MINUTE_IN_MILLISECOND = (1 * 60 * 1000);

export const usePreload = <
	Data extends any[],
	Filter extends Record<string, any> = Record<string, any>,
>(
	{
		maxPerPage,
		method,
		preload = {},
		filter,
		sort,
		page,
		initialPage
	}: PreloadProps<Data, Filter>
) => {
	if ( IS_DEV ) {
		if ( maxPerPage && !Number.isInteger(maxPerPage) ) {
			throw new Error('`maxPerPage` needs to be integer');
		}
	}
		
	const preloadRef = useRef<
		Record<
			number, 
			{ 
				data: Promise<{ data: Data, totalItems?: number }>
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

	function _getMethod(metadata: PaginationMetadata<Filter>): Promise<PreloadMethodResult<Data>> {
		const page = metadata.pagination.page;

		if ( willPreload(page) ) {
			return preloadRef.current[page].data;
		}

		preloadRef.current[page] = {
			date: Date.now(),
			data: method(metadata)
		}

		return preloadRef.current[page].data;
	}

	function preloadMethod(metadata: PaginationMetadata<Filter>, res: PreloadMethodResult<Data>) {
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
		if ( page === initialPage ) {
			preloadRef.current = {};
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, filter, sort])

	async function getMethod(metadata: PaginationMetadata<Filter>) {
		const res = await _getMethod(metadata);

		preloadMethod(metadata, res);

		return res;
	}

	async function getMultipleMethod(
		metadata: PaginationMetadata<Filter>, 
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
		metadata: PaginationMetadata<Filter>, 
		pagination: PaginationSearchParams,
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
					data: Promise.resolve({
						data: newData,
						totalItems
					}),
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
		getRestoreMethod
	}
}

import { useRef } from 'react'

import { type PaginationMetadata } from '../types'
import { type PaginationSearchParamsType } from '../types/ParamsType'
import { IS_DEV } from '../utils/constants'
import { calculateTotalPages } from '../utils/utils'

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

export type PreloadRef<Data> = Record<
	string, 
	{ 
		data: { data: Data, totalItems?: number }
		date: number 
	}
>

export type PreloadProps<
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>,
> = {
	deps: readonly any[]
	initialPage: number
	method: (metadata: PaginationMetadata<FilterSearchParams>) => Promise<PreloadMethodResult<Data>>
	preload?: PreloadConfig
}

const ONE_MINUTE_IN_MILLISECOND = (1 * 60 * 1000);

export const usePreload = <
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>,
>(
	{
		method,
		preload = {},
		initialPage,
		deps
	}: PreloadProps<Data, FilterSearchParams>
) => {
	if ( IS_DEV ) {
		if ( typeof preload === 'object' && preload.maxPerPage && !Number.isInteger(preload.maxPerPage) ) {
			throw new Error('`maxPerPage` needs to be integer');
		}
	}
		
	const preloadRef = useRef<PreloadRef<Data>>({});

	function getKey(page: number) {
		return `${page}_${deps.length ? JSON.stringify(deps) : ''}`
	}

	function willPreload(page: number) {
		const key = getKey(page);
		return (
			preload !== false && 
			preloadRef.current[key] &&
			Date.now() - preloadRef.current[key].date <= (preload.timeout ?? ONE_MINUTE_IN_MILLISECOND)
		)
	}

	async function _getMethod(metadata: PaginationMetadata<FilterSearchParams>): Promise<PreloadMethodResult<Data>> {
		const page = metadata.pagination.page;
		const key = getKey(page);

		if ( willPreload(page) ) {
			return preloadRef.current[key].data;
		}

		const data = await method(metadata);

		preloadRef.current[key] = {
			date: Date.now(),
			data
		}

		return preloadRef.current[key].data;
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

				const key = getKey(index + initialPage);
				preloadRef.current[key] = {
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

import { useEffect, useRef } from 'react';

import { type PaginationMetadata } from '../types';
import { type PaginationSearchParamsType } from '../types/ParamsType';
import { IS_DEV } from '../utils/constants';
import { calculateTotalPages } from '../utils/utils';

export type PreloadConfig = false | {
	maxPerPage?: number
	next?: boolean
	previous?: boolean
	/**
	 * @default 60000 miliseconds (1minute)
	 */
	timeout?: number
};

export type PreloadMethodResult<Data extends any[]> = {
	data: Data
	totalItems?: number
};

export type PreloadProps<
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>
> = {
	deps: readonly any[]
	initialPage: number
	method: (metadata: PaginationMetadata<FilterSearchParams>) => Promise<PreloadMethodResult<Data>>
	preload?: PreloadConfig
};

export type PreloadRef<Data> = Record<
	number,
	{
		data: {
			data: Data
			totalItems?: number
		}
		date: number
	}
>;

const ONE_MINUTE_IN_MILLISECOND = (1 * 60 * 1000);

export const usePreload = <
	Data extends any[],
	FilterSearchParams extends Record<string, any> = Record<string, any>
>(
	{
		deps,
		initialPage,
		method,
		preload = {}
	}: PreloadProps<Data, FilterSearchParams>
) => {
	if (IS_DEV && typeof preload === 'object' && preload.maxPerPage && !Number.isInteger(preload.maxPerPage)) {
		throw new Error('`maxPerPage` needs to be integer');
	}

	const preloadRef = useRef<PreloadRef<Data>>({});

	useEffect(() => {
		preloadRef.current = {};
	}, deps);

	function willPreload(page: number) {
		return (
			preload !== false
			&& preloadRef.current[page]
			&& Date.now() - preloadRef.current[page].date <= (preload.timeout ?? ONE_MINUTE_IN_MILLISECOND)
		);
	}

	async function _getMethod(metadata: PaginationMetadata<FilterSearchParams>): Promise<PreloadMethodResult<Data>> {
		const page = metadata.pagination.page;

		if (willPreload(page)) {
			return preloadRef.current[page].data;
		}

		const data = await method(metadata);

		preloadRef.current[page] = {
			data,
			date: Date.now()
		};

		return preloadRef.current[page].data;
	}

	function preloadMethod(metadata: PaginationMetadata<FilterSearchParams>, res: PreloadMethodResult<Data>) {
		if (preload === false) {
			return;
		}

		if (preload.previous !== false) {
			const previousPage = metadata.pagination.page - 1;

			if (previousPage >= initialPage) {
				_getMethod(
					{
						...metadata,
						pagination: {
							...metadata.pagination,
							page: previousPage
						}
					}
				);
			}
		}

		if (preload.next !== false) {
			const nextPage = metadata.pagination.page + 1;
			const totalPages = calculateTotalPages(metadata.pagination.perPage, res.totalItems);
			if (initialPage
				? nextPage <= totalPages
				: nextPage < totalPages) {
				_getMethod(
					{
						...metadata,
						pagination: {
							...metadata.pagination,
							page: nextPage
						}
					}
				);
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
						page: index + initialPage,
						perPage: maxPerPage
					}
				})
			)
		);

		const totalItems = results[0].totalItems;
		const data = results.flatMap(({ data }) => data) as Data;

		return {
			data,
			totalItems
		};
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
				perPage: pagination.perPage * pagination.page
			}
		};

		preloadRef.current = {};

		const maxPerPage = typeof preload === 'object'
			? preload.maxPerPage
			: undefined;

		const { data, totalItems } = await (
			maxPerPage
				? getMultipleMethod(_metadata, Math.min(maxPerPage, _metadata.pagination.perPage))
				: _getMethod(_metadata)
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
				onData && onData(newIndex, newData);

				const page = index + initialPage;
				preloadRef.current[page] = {
					data: {
						data: newData,
						totalItems
					},
					date
				};
				return;
			}
		);

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
		getMethod,
		getRestoreMethod,
		preloadRef,
		willPreload
	};
};

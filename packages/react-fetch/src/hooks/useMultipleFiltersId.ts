import { useEffect, useState } from 'react';

import { type ParamsType } from '../types/ParamsType';

let id = 0;
let hashId = 0;

const KEY = '$f'

export function useMultipleFiltersId({ hash }: { hash?: boolean }) {
	const [fId] = useState<string>(() => {
		const _id = hash ? hashId : id;
		const newFId: string = _id ? `${KEY}${_id}` : '';

		hash ? hashId++ : id++

		return newFId
	});
	useEffect(() => {
		return () => {
			hash ? hashId-- : id--
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return fId;
}

export function removeCacheIds<
	FilterSearchParams extends Record<string, any> = Record<string, any>
>(
	params: FilterSearchParams
) {
	return Object.fromEntries(
		Object.entries(params)
		.filter(([key]) => !key.startsWith(KEY))
	) as ParamsType<FilterSearchParams>
}

export function filterByCacheIds<
	FilterSearchParams extends Record<string, any> = Record<string, any>
>(
	id: string,
	params: FilterSearchParams
) {
	if ( id ) {
		return params;
	}
	return Object.fromEntries(
		Object.entries(params)
		.filter(([key]) => key.startsWith(KEY))
	) as ParamsType<FilterSearchParams>
}

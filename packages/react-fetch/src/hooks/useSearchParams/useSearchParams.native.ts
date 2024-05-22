/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useState } from 'react';

import { type DefaultPaginationType, type FilterType } from '../../types/types';

export const useSearchParams = <
	Filter extends Record<string, any> = Record<string, any>,
>(
	{
		filter, 
		pagination,
		sort
	}: DefaultPaginationType<Filter>,
	_hash: boolean
) => {
	const [params, setParams] = useState<FilterType<Filter>>(() => ({
		...filter, 
		...pagination,
		sort
	} as FilterType<Filter>))

	const getPaginationHref = (page: number) => {
		throw new Error('\'getPaginationHref\' is not supported in react-native')
	}

	return {
		params,
		setParams,
		getPaginationHref
	} as const
}

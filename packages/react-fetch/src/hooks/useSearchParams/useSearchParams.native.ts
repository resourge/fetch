/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useState } from 'react';

import { type ParamsType } from '../../types/ParamsType';

import { type SearchParamsResult, type SearchParamsProps } from './types';

export const useSearchParams = <
	FilterSearchParams extends Record<string, any> = Record<string, any>,
>(
	{
		filter, 
		pagination,
		sort
	}: SearchParamsProps<FilterSearchParams>
): SearchParamsResult<FilterSearchParams> => {
	const [params, setParams] = useState<ParamsType<FilterSearchParams>>(() => ({
		...filter, 
		...pagination,
		sort
	} ))

	return {
		params,
		setParams,
		getPaginationHref(page: number) {
			throw new Error('\'getPaginationHref\' is not supported in react-native')
		}
	} as const
}

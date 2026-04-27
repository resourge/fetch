import { useMemo, useState } from 'react';
import { useEffectEvent } from 'react';

import { type FilterParamsProps, type State } from '../../types/FilterParamsTypes';
import { type ParamsType } from '../../types/ParamsType';
import { deepCompare } from '../../utils/comparisonUtils';

export const useMemoryState = <
	TData,
	TFilter extends Record<string, any> = Record<string, any>
>(
	{
		defaultFilter,
		defaultSort,
		deps,
		enable,
		fetch,
		filterKeysRef,
		initialPage,
		initialPerPage,
		preloadRef
	}: FilterParamsProps<TData, TFilter>
) => {
	const _fetch = useEffectEvent(fetch);

	function getDefaultState(): Omit<State<TFilter>, 'url'> {
		return {
			filter: defaultFilter,
			pagination: {
				page: initialPage,
				perPage: initialPerPage,
				totalItems: 0,
				totalPages: 0
			},
			sort: defaultSort
		};
	}

	const [data, setData] = useState(getDefaultState);

	// To make sure data gets reset on deps change
	// eslint-disable-next-line react-hooks/void-use-memo
	useMemo(() => {
		const {
			filter, pagination, sort
		} = getDefaultState();
		// eslint-disable-next-line react-hooks/immutability
		data.filter = filter;
		data.pagination = pagination;
		data.sort = sort;
	// eslint-disable-next-line react-hooks/use-memo
	}, deps);

	const setParams = <F extends Record<string, any> = TFilter>({
		f: filter,
		page = data.pagination.page,
		perPage = data.pagination.perPage,
		sort = data.sort
	}: ParamsType<F>) => {
		const whatChanged = new Set<'filter' | 'pagination' | 'sort'>();

		if (perPage !== undefined && data.pagination.perPage !== perPage) {
			preloadRef.current = {};
			whatChanged.add('pagination');
		}

		if (page !== undefined && data.pagination.page !== page) {
			whatChanged.add('pagination');
		}

		if (!deepCompare(sort, data.sort)) {
			whatChanged.add('sort');
			preloadRef.current = {};
		}

		if (
			filter
			&& !deepCompare(filter, data.filter, filterKeysRef.current.state)
		) {
			whatChanged.add('filter');
			preloadRef.current = {};
		}

		if (whatChanged.size > 0) {
			const newData: Omit<State<TFilter>, 'url'> = {
				filter: filter as TFilter,
				pagination: {
					...data.pagination,
					page,
					perPage
				},
				sort
			};

			setData(newData);

			if (enable === false) {
				return;
			}

			// eslint-disable-next-line react-hooks/rules-of-hooks
			_fetch(newData, whatChanged);
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function getPaginationHref(_page: number) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'getPaginationHref is not supported in "state" paramsMode. Returning "#".'
			);
		}
		return '#';
	}

	return {
		data,
		getPaginationHref,
		setParams
	};
};

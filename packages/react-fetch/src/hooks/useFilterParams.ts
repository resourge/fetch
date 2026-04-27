import { type FilterParamsProps, type FilterParamsReturn, type SortTableFunctionType } from '../types/FilterParamsTypes';
import { type OrderByEnum, type ParamsType, type SortCriteria } from '../types/ParamsType';

import { useMemoryState } from './useState/useMemoryState';
import { useSearchParamsState } from './useState/useSearchParamsState';

/**
 * Bridge hook that delegates to `useFilterSearchParams` or `useStateFilterParams`
 * based on `paramsMode` (`'url'` | `'state'`, default `'url'`).
 *
 * - `'url'`: persists filter/sort/pagination in the browser URL (shareable, deep-linkable).
 * - `'state'`: keeps params in memory — ideal for modals, drawers, or React Native.
 *   `fId` and `hash` are ignored in this mode.
 *
 * Both modes expose the same {@link FilterParamsReturn} interface, so consumer hooks
 * (`usePagination`, `useInfiniteLoading`) work without changes.
 */
export const useFilterParams = <
	Data,
	FilterParams extends Record<string, any> = Record<string, any>
>(
	props: FilterParamsProps<Data, FilterParams>
): FilterParamsReturn<FilterParams> => {
	const {
		data, getPaginationHref, setParams
	} = (props.paramsMode === 'state'
		? useMemoryState
		: useSearchParamsState)(props);

	const setFilter = ({
		page = props.initialPage,
		perPage = data.pagination.perPage,
		sort = data.sort,
		...filter
	}: ParamsType<FilterParams>) => {
		setParams<FilterParams>({
			f: {
				...data.filter,
				...filter
			},
			page,
			perPage,
			sort
		});
	};

	const sortTable = (
		orderBy: OrderByEnum | SortCriteria,
		orderColumn: string
	) => {
		if (Array.isArray(orderBy)) {
			setFilter({
				page: props.initialPage,
				sort: orderBy
			});
			return;
		}
		const sort = data.sort
			? [...data.sort]
			: [];

		const index = sort.findIndex((val) => val.orderColumn === orderColumn);

		if (index === -1) {
			sort.push({
				orderBy,
				orderColumn
			});
		}
		else {
			sort[index] = {
				orderBy,
				orderColumn
			};
		}

		setFilter({
			page: props.initialPage,
			sort
		});
	};

	return {
		filter: data.filter,
		getPaginationHref,
		pagination: data.pagination,
		setFilter,
		setParams,
		sort: data.sort,
		sortTable: sortTable as SortTableFunctionType
	};
};

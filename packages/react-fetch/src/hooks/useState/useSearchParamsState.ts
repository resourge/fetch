import { useEffect, useMemo } from 'react';
import { useEffectEvent } from 'react';

import { HistoryStore } from '@resourge/history-store';
import { createNewUrlWithSearch, parseParams, parseSearchParams } from '@resourge/history-store/utils';

import { type FilterParamsProps, type State } from '../../types/FilterParamsTypes';
import { type ParamsType } from '../../types/ParamsType';
import { deepCompare } from '../../utils/comparisonUtils';

export const useSearchParamsState = <
	Data,
	FilterSearchParams extends Record<string, any> = Record<string, any>
>(
	{
		defaultFilter,
		defaultSort,
		deps,
		enable,
		fetch,
		fId,
		filterKeysRef,
		hash,
		initialPage,
		initialPerPage,
		preloadRef
	}: FilterParamsProps<Data, FilterSearchParams>
) => {
	const _fetch = useEffectEvent(fetch);

	function getParams(url: URL) {
		let searchParams = url.searchParams;
		if (hash) {
			const hashUrl = new URL(
				url.hash.slice(1),
				globalThis.location.origin
			);
			searchParams = hashUrl.searchParams;
		}

		return parseSearchParams<ParamsType<FilterSearchParams> & Record<string, any>>(
			searchParams,
			{
				f: defaultFilter,
				page: initialPage,
				perPage: initialPerPage,
				sort: defaultSort
			}
		);
	}

	function getDataFromParams(): State<FilterSearchParams> {
		const [url] = HistoryStore.getValue();

		const params = getParams(url);
		const {
			f: filter = defaultFilter,
			page = initialPage,
			perPage = initialPerPage,
			sort = defaultSort
		} = (fId
			? (params[fId] ?? {})
			: params);

		return {
			filter,
			pagination: {
				page,
				perPage,
				totalItems: 0,
				totalPages: 0
			},
			sort,
			url
		};
	}
	
	// eslint-disable-next-line react-hooks/use-memo
	const data = useMemo(getDataFromParams, deps);

	const setParams = <F extends Record<string, any> = FilterSearchParams>(newFilter: ParamsType<F>) => {
		const [url] = HistoryStore.getValue();
		const params = getParams(url);

		const newSearch = parseParams({
			...params,
			...fId
				? ({
					[fId]: newFilter
				})
				: newFilter
		});

		if (url.search !== newSearch) {
			const newURL = createNewUrlWithSearch(
				url,
				newSearch,
				hash
			);

			HistoryStore.navigate(
				newURL,
				{
					replace: true
				}
			);
		}
	};

	useEffect(() => {
		if (enable === false) {
			return;
		}

		return HistoryStore.subscribe(() => {
			const {
				filter,
				pagination: {
					page,
					perPage
				},
				sort,
				url: subscribeURL
			} = getDataFromParams();

			const whatChanged = new Set<'filter' | 'pagination' | 'sort'>();

			if (
				perPage !== undefined && data.pagination.perPage !== perPage
			) {
				preloadRef.current = {};
				whatChanged.add('pagination');
				data.pagination.perPage = perPage;
			}

			if (
				page !== undefined && data.pagination.page !== page
			) {
				whatChanged.add('pagination');
				data.pagination.page = page;
			}

			if (!deepCompare(sort, data.sort)) {
				whatChanged.add('sort');
				preloadRef.current = {};
				data.sort = sort;
			}

			if (
				!deepCompare(
					filter,
					data.filter,
					filterKeysRef.current.state
				)
			) {
				whatChanged.add('filter');
				preloadRef.current = {};
				data.filter = filter;
			}

			if (whatChanged.size > 0) {
				if (hash) {
					const newRenderURL = new URL(
						data.url.hash.slice(1),
						globalThis.location.origin
					);
					const newSubscribeURL = new URL(
						subscribeURL.hash.slice(1),
						globalThis.location.origin
					);
					if (newRenderURL.hash !== newSubscribeURL.hash) {
						return;
					}
				}
				else if (data.url.pathname !== subscribeURL.pathname) {
					return;
				}
				_fetch(data, whatChanged);
			}
		});
	}, [data, enable]);

	function getPaginationHref(page: number) {
		const [url] = HistoryStore.getValue();
		return createNewUrlWithSearch(
			url,
			parseParams({
				page,
				perPage: data.pagination.perPage,
				sort: data.sort,
				...data.filter
			}),
			hash
		).href;
	}

	return {
		data,
		getPaginationHref,
		setParams
	};
};

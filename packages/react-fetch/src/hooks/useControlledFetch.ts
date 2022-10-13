/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useRef } from 'react';

import { HttpService, RequestConfig } from '../../../http-service/src';
import { FetchTrigger, useFetchContext } from '../context/FetchContext';
import { TriggerWithoutHttpProviderError } from '../errors/TriggerWithoutHttpProviderError';
import { useId } from '../utils/useIdShim';
import { triggerFetch } from '../utils/utils';
import { validateTrigger } from '../utils/validateIfTriggerDoesCreateInfiniteLoop';

type RequestOnFunction = (this: { id: string }, config: RequestConfig) => RequestConfig

export type ControlledFetchResult<T extends any[], Result = any> = (...args: T) => Promise<Result>

export type ControlledFetchConfig = {
	/**
	 * To abort on component unmount.
	 */
	abort?: boolean

	/**
	 * Serves as an uniqueId to be able to trigger in other fetch calls
	 */
	fetchId?: string

	/**
	 * To trigger other useFetchCallback/useFetch.
	 * * Note: In the case of useFetchCallback having params, its necessary to set
	 * * trigger after/before with name and params instead of a string
	 */
	trigger?: FetchTrigger
}

/**
 * Hook to fetch and set data.
 * It will manually abort request if component is unmounted, and/or triggering other useFetch/useFetchCallback's
 * @param method - promise
 * @param config {@link ControlledFetchConfig} - fetch callback config's. They override default HttpProvider config's.
 */
export const useControlledFetch = <T extends any[], Result = any>(
	method: (...args: T) => Promise<Result>,
	config?: ControlledFetchConfig
): ControlledFetchResult<T, Result> => {
	const functionId = useId();
	const context = useFetchContext();
	if ( __DEV__ ) {
		if ( config?.trigger && !context ) {
			throw new TriggerWithoutHttpProviderError();
		}

		validateTrigger(context, config?.trigger, config?.fetchId);
	}

	const controllersRef = useRef<AbortController[]>([]);

	useEffect(() => {
		if ( config?.abort ) {
			return () => {
				if ( controllersRef.current.length ) {
					controllersRef.current.forEach((controller) => {
						controller.abort();
					})
				}
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const request: ControlledFetchResult<T, Result> = async (...args: T) => {
		await triggerFetch(context, config?.trigger?.before);

		const requestOn: RequestOnFunction = function (config: RequestConfig) {
			if ( this.id === functionId ) {
				if ( !config.signal ) {
					const controller = new AbortController();
					const signal = controller.signal;

					controllersRef.current.push(controller);
	
					return {
						...config,
						signal
					}
				}
			}
			return config;
		}

		const removeInterceptor = HttpService.interceptors.request.use(
			requestOn.bind({
				id: functionId 
			}),
			(error) => error
		)

		const result = await method(...args);

		controllersRef.current = [];
		removeInterceptor();

		await triggerFetch(context, config?.trigger?.after);

		return result;
	}

	useEffect(() => {
		if ( config?.fetchId && context ) {
			context.request.set(config?.fetchId, {
				request: request as unknown as (...args: any[]) => Promise<void>,
				trigger: config.trigger
			});

			return () => {
				context.request.delete(config.fetchId!)
			}
		}
	})

	return request;
}

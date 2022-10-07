/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useRef } from 'react';

import HttpService from '../../../http-service/src/services/HttpService';
import { RequestConfig } from '../../../http-service/src/types/RequestConfig';

import { FetchTrigger, useFetchContext } from '../context/FetchContext';
import { TriggerWithoutHttpProviderError } from '../errors/TriggerWithoutHttpProviderError';
import { useId } from '../utils/useIdShim';
import { triggerFetch } from '../utils/utils';
import { validateTrigger } from '../utils/validateIfTriggerDoesCreateInfiniteLoop';

type RequestOnFunction = (this: { id: string }, config: RequestConfig) => RequestConfig

export interface FetchCallbackResult<T extends any[]> {
	(...args: T): Promise<void>
	isFetching: () => boolean
}

export type FetchCallbackConfig = {
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
 * @param config {@link FetchCallbackConfig} - fetch callback config's. They override default HttpProvider config's.
 */
export const useFetchCallback = <T extends any[]>(
	method: (...args: T) => Promise<void>,
	config?: FetchCallbackConfig
): FetchCallbackResult<T> => {
	const functionId = useId();
	const context = useFetchContext();
	if ( __DEV__ ) {
		if ( config?.trigger && !context ) {
			throw new TriggerWithoutHttpProviderError();
		}

		validateTrigger(context, config?.trigger, config?.fetchId);
	}

	const isFetchingRef = useRef<boolean>(false);
	const controllersRef = useRef<AbortController[]>([]);

	useEffect(() => {
		return () => {
			if ( controllersRef.current.length ) {
				controllersRef.current.forEach((controller) => {
					controller.abort();
				})
			}
		}
	}, [])

	const request: FetchCallbackResult<T> = async (...args: T) => {
		isFetchingRef.current = true;
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

		await method(...args);

		controllersRef.current = [];
		removeInterceptor();

		await triggerFetch(context, config?.trigger?.after);
		isFetchingRef.current = false;
	}

	request.isFetching = () => {
		return isFetchingRef.current;
	};

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

import React, { useEffect, useMemo, useRef } from 'react';

import HttpService, { HttpServiceClass, setDefaultHttpService } from '../../../http-service/src/services/HttpService';
import {
	InterceptorOnRequest,
	InterceptorOnRequestError,
	InterceptorOnResponse,
	InterceptorOnResponseError
} from '../../../http-service/src/utils/Interceptors'
import { isBrowser } from '../../../http-service/src/utils/utils';

import {
	FetchContext,
	FetchContextConfig,
	FetchContextType,
	useFetchContext
} from '../context/FetchContext'
import { MissingBaseUrlError } from '../errors/MissingBaseUrlError';
import { MultipleHttpProviderError } from '../errors/MultipleHttpProviderError';

type Props = {
	children: React.ReactNode

	/**
	 * Base http url
	 */
	baseUrl?: string

	/**
	 * Set default HttpContextConfig.
	 */
	config?: FetchContextConfig

	/**
	 * Serves to override default HttpService.
	 * Use with care.
	 * Try to only override existing functions, as new functions/variables 
	 * will not be reflected on the type. Or if you want new functions that 
	 * you deem appropriated ask me.
	 */
	httpService?: new() => HttpServiceClass
	/**
	 * Intercepts on every request.
	 * Serves to inject token, headers and some configs.
	 */
	onRequest?: InterceptorOnRequest
	/**
	 * Intercepts on every request error.
	 */
	onRequestError?: InterceptorOnRequestError
	/**
	 * Intercepts on every response.
	 * Serves manipulate the response.
	 */
	onResponse?: InterceptorOnResponse
	/**
	 * Intercepts on every response error.
	 */
	onResponseError?: InterceptorOnResponseError
}

/**
 * Component to provide a way to inject headers, token or config.
 */
const FetchProvider: React.FC<Props> = ({ 
	children, 
	httpService: fetchService,
	config,
	baseUrl,
	onRequest = (config) => config, 
	onRequestError = (config) => config,
	onResponse = (config) => config, 
	onResponseError = (error) => Promise.reject(error) 
}) => {
	if ( __DEV__ ) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const context = useFetchContext();

		if ( context ) {
			throw new MultipleHttpProviderError();
		}

		if ( !baseUrl && !isBrowser() ) {
			throw new MissingBaseUrlError();
		}
	}

	const onRequestRef = useRef<{
		onRequest: InterceptorOnRequest
		onRequestError: InterceptorOnRequestError
		
		onResponse: InterceptorOnResponse
		onResponseError: InterceptorOnResponseError
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	}>(null!);

	onRequestRef.current = {
		onRequest,
		onRequestError,
		onResponse,
		onResponseError
	};

	useEffect(() => {
		if ( fetchService ) {
			// eslint-disable-next-line new-cap
			const newHttpService = new fetchService();

			newHttpService.baseUrl = baseUrl ?? newHttpService.baseUrl;
			setDefaultHttpService(newHttpService)
		}
		const removeRequest = HttpService.interceptors.request.use(
			(config) => {
				return onRequestRef.current.onRequest(config);
			},
			(error) => {
				return onRequestRef.current.onRequestError(error);
			}
		)
		const removeResponse = HttpService.interceptors.response.use(
			(data) => {
				return onRequestRef.current.onResponse(data);
			},
			(error) => {
				return onRequestRef.current.onResponseError(error);
			}
		)

		return () => {
			removeRequest();
			removeResponse();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const value = useMemo((): FetchContextType => ({
		request: new Map(),
		config
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}), [])

	return (
		<FetchContext.Provider value={value}>
			{ children }
		</FetchContext.Provider>
	);
};

export default FetchProvider;

import React, {
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react'

import {
	InterceptorOnRequest,
	InterceptorOnRequestError,
	InterceptorOnResponse,
	InterceptorOnResponseError,
	isBrowser,
	HttpService,
	HttpServiceClass,
	setDefaultHttpService
} from '../../../http-service/src/index'

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
	onRequestError,
	onResponse = (data) => data,
	onResponseError
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

	const ref = useRef<{
		onRequest: InterceptorOnRequest
		onResponse: InterceptorOnResponse
		
		removeRequest: () => void
		removeResponse: () => void

		onRequestError?: InterceptorOnRequestError
		onResponseError?: InterceptorOnResponseError
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	}>(null!);

	ref.current = {
		onRequest,
		onRequestError,
		onResponse,
		onResponseError,
		removeRequest: () => {},
		removeResponse: () => {}
	};

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const [httpService] = useState(() => {
		let _newHttpService
		if ( fetchService ) {
			// eslint-disable-next-line new-cap
			const newHttpService = new fetchService();

			newHttpService.baseUrl = baseUrl ?? newHttpService.baseUrl;
			setDefaultHttpService(newHttpService)

			_newHttpService = newHttpService;
		}
		_newHttpService = HttpService;

		ref.current.removeRequest = _newHttpService.interceptors.request.use(
			(config) => {
				return ref.current.onRequest(config);
			},
			ref.current.onRequestError ? (error) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
				return ref.current.onRequestError!(error);
			} : undefined
		)
		ref.current.removeResponse = _newHttpService.interceptors.response.use(
			(data) => {
				return ref.current.onResponse(data);
			},
			ref.current.onResponseError ? (error) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
				return ref.current.onResponseError!(error);
			} : undefined
		)

		return _newHttpService;
	});

	useEffect(() => {
		return () => {
			ref.current.removeRequest();
			ref.current.removeResponse();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const value = useMemo((): FetchContextType => ({
		request: new Map(),
		config,
		HttpService: httpService
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}), [httpService])

	return (
		<FetchContext.Provider value={value}>
			{ children }
		</FetchContext.Provider>
	);
};

export default FetchProvider;

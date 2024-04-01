import { type NormalizeRequestConfig } from './normalizeHeaders'

/**
 * Generate cacheKey for throttle.
 */
export const getCacheKey = (
	config: NormalizeRequestConfig
): string => {
	return `${config.url.href}_${config.method ?? 'get'}_${JSON.stringify(config.headers)}`
}

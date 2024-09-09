const transformURLSearchParams = (
	params: Array<[string, any]>
): any[] => {
	return params
	.reduce<any[]>((arr, [key, value]) => {
		const newArr = convertValue(key, value);
    
		if ( Array.isArray(newArr[0]) ) {
			arr.push(...newArr)
		}
		else {
			arr.push(newArr)
		}
    
		return arr;
	}, [])
}

const transformURLSearchParamsFromArray = <K extends any[]>(
	params: K,
	baseKey: string = ''
): any[] => transformURLSearchParams(
	params
	.map(([_key, value]) => [`${baseKey}[]`, value])
)

const transformURLSearchParamsFromObject = <K extends object>(
	params: K,
	baseKey: string = ''
): any[] => {
	const _baseKey = baseKey ? `${baseKey}.` : '';
	return transformURLSearchParams(
		Object.entries(params)
		.map(([key, value]) => [`${_baseKey}${key}`, value])
	)
}

const convertValue = (key: string, value: any): any[] => {
	if ( Array.isArray(value) ) {
		return transformURLSearchParamsFromArray(value, key)
	}
	if ( value && typeof value === 'object' ) {
		return transformURLSearchParamsFromObject(value, key)
	}
	if ( value == null ) {
		return []
	}

	return [key, value]
}

/**
 * Method to transform params into QueryStrings
 */
export const convertParamsToQueryString = <K extends object | any[]>(params: K) => {
	return new URLSearchParams(convertValue('', params).filter((v) => v.length))
}

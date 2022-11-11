
export const transformURLSearchParamsFromArray = <K extends any[]>(
	params: K,
	baseKey: string = ''
): any[] => {
	return params
	.reduce<any[]>((arr, [_key, value]) => {
		const key = `${baseKey ? `${baseKey}` : ''}[]`
    
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

export const transformURLSearchParamsFromObject = <K extends object>(
	params: K,
	baseKey: string = ''
): any[] => {
	return Object.entries(params)
	.reduce<any[]>((arr, [_key, value]) => {
		const key = `${baseKey ? `${baseKey}.` : ''}${_key}`
    
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

const convertValue = (key: string, value: any): any[] => {
	if ( Array.isArray(value) ) {
		return transformURLSearchParamsFromArray(value, key)
	}
	if ( typeof value === 'object' ) {
		return transformURLSearchParamsFromObject(value, key)
	}	

	return [key, value]
}

/**
 * Method to transform params into QueryStrings
 */
export const convertParamsToQueryString = <K extends object | any[]>(params: K) => {
	return new URLSearchParams(convertValue('', params).filter((v) => v.length))
}

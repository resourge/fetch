import { FetchContextType, FetchTrigger } from '../context/FetchContext';
import { InfiniteLoopError } from '../errors/InfiniteLoopError';

const validateIfTriggerDoesCreateInfiniteLoop = (context?: FetchContextType, trigger?: FetchTrigger, originalName?: string, previousName: string | undefined = originalName): string => {
	if ( context && trigger && originalName ) {
		const arr = [
			...(trigger.before ?? []),
			...(trigger.after ?? [])
		]
		.filter((name, index, arr) => arr.findIndex((arrName) => arrName === name) === index)
		
		for (let i = 0; i < arr.length; i++) {
			const _name = arr[i];
			const name = typeof _name === 'object' ? _name.loaderId : _name;
			
			if ( name === originalName ) {
				return `${previousName ?? originalName} > ${name}`
			}

			const contextRequest = context.request.get(name)
			if ( contextRequest && contextRequest.trigger ) {
				return validateIfTriggerDoesCreateInfiniteLoop(context, contextRequest.trigger, originalName, `${previousName ?? originalName} > ${name}`)
			}
		}
	}

	return ''
}

export const validateTrigger = (context?: FetchContextType, trigger?: FetchTrigger, originalName?: string) => {
	const infiniteLoopString = validateIfTriggerDoesCreateInfiniteLoop(context, trigger, originalName);
	if ( infiniteLoopString ) {
		throw new InfiniteLoopError(infiniteLoopString)
	}
}

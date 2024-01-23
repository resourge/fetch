const convertModelToFormData = <K>(model: K, formData: FormData, namespace: string = ''): FormData => {
	if ( model !== undefined && model !== null ) {
		if ( Array.isArray(model) ) {
			model.forEach((m: any, index: number) => {
				convertModelToFormData(m, formData, `${namespace}[${index}]`);
			})
		}
		else if ( typeof model === 'object' && !(model instanceof Date) ) {
			Object.keys(model)
			.forEach((key: string) => {
				const _namespace: string = `${namespace ? `${namespace}.` : ''}${key}`;
				const _model: any = model[key as keyof typeof model];
				convertModelToFormData(_model, formData, _namespace);
			})
		}
		else {
			let value: any = model;
			if (value instanceof Date) {
				value = value.toISOString();
			}
			formData.append(namespace, value)
		}
	}

	return formData;
}

/**
 * Convert model to formData.
 * @param files {Files}
 * @param model {any}
 * @param formDataKey {string} - formData key (default: 'formFiles')
 */
export const formatToFormData = <K>(files: File[], model: K, formDataKey?: string): FormData => {
	const formData: FormData = new FormData();

	if ( files && files.length ) {
		files.forEach((file: File) => {
			formData.append(formDataKey ?? 'formFiles', file);
		});
	}

	return convertModelToFormData(model, formData);
}

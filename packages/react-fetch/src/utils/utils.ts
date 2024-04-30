export const calculateTotalPages = (perPage: number, totalItems: number = 0) => Math.ceil(totalItems / perPage) || 1;

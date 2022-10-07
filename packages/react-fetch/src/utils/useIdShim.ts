import { useId as _useId, useState } from 'react'

let id = 0;

export const getNewId = () => String(id++)
export const useId = _useId ?? (() => useState(getNewId)[0])

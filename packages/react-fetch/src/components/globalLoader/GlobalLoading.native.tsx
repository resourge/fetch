import { ActivityIndicator } from 'react-native'

import { type GlobalLoadingProps } from './constants'

export const GlobalLoading = ({ color }: GlobalLoadingProps) => (
	<ActivityIndicator color={color} size="large" />
)

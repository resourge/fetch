import React from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native'

import Loader from '../Loader';

import { GlobalLoading } from './GlobalLoading.native';
import { type BaseGlobalLoaderProps, globalColor, setGlobalLoading } from './constants'

export type GlobalLoaderProps = BaseGlobalLoaderProps<StyleProp<ViewStyle>>

// eslint-disable-next-line react/no-multi-comp
const GlobalLoader: React.FC<GlobalLoaderProps> = ({
	loaderId, style, children, color = globalColor
}) => {
	const globalLoading = setGlobalLoading(children ?? <GlobalLoading color={color} />)

	return (
		<Loader 
			loaderId={loaderId}
			loadingElement={(
				<View
					style={[
						{
							flex: 1,
							position: 'absolute',
							width: '100%',
							height: '100%',
							justifyContent: 'center',
							alignItems: 'center',
							backgroundColor: 'rgba(0,0,0,0.5)',
							elevation: 1000
						}, 
						style
					]}
				>
					{ globalLoading }
				</View>
			)}
		/>
	)
};

export default GlobalLoader;

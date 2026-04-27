import React from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';

import Loader from '../Loader';

import { type BaseGlobalLoaderProps, globalColor, setGlobalLoading } from './constants';
import { GlobalLoading } from './GlobalLoading.native';

export type GlobalLoaderProps = BaseGlobalLoaderProps<StyleProp<ViewStyle>>;
 
const GlobalLoader: React.FC<GlobalLoaderProps> = ({
	children, color = globalColor, loaderId, style
}) => {
	const globalLoading = setGlobalLoading(children ?? <GlobalLoading color={color} />);

	return (
		<Loader 
			loaderId={loaderId}
			loadingElement={(
				<View
					style={[
						{
							alignItems: 'center',
							backgroundColor: 'rgba(0,0,0,0.5)',
							elevation: 1000,
							flex: 1,
							height: '100%',
							justifyContent: 'center',
							position: 'absolute',
							width: '100%'
						}, 
						style
					]}
				>
					{ globalLoading }
				</View>
			)}
		/>
	);
};

export default GlobalLoader;

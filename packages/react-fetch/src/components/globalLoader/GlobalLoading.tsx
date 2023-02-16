import { type GlobalLoadingProps } from './constants'

export const GlobalLoading = ({ color }: GlobalLoadingProps) => (
	<svg height="100" stroke={color} viewBox="0 0 44 44" width="100" xmlns="http://www.w3.org/2000/svg">
		<g fill="none" fillRule="evenodd" strokeWidth="2">
			<circle cx="22" cy="22" r="1">
				<animate attributeName="r" begin="0s" calcMode="spline" dur="1.8s" keySplines="0.165, 0.84, 0.44, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 20"></animate>
				<animate attributeName="strokeOpacity" begin="0s" calcMode="spline" dur="1.8s" keySplines="0.3, 0.61, 0.355, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 0"></animate>
			</circle>
			<circle cx="22" cy="22" r="1">
				<animate attributeName="r" begin="-0.9s" calcMode="spline" dur="1.8s" keySplines="0.165, 0.84, 0.44, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 20"></animate>
				<animate attributeName="strokeOpacity" begin="-0.9s" calcMode="spline" dur="1.8s" keySplines="0.3, 0.61, 0.355, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 0"></animate>
			</circle>
		</g>
	</svg>
)

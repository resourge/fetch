import {
	renderHook,
	act,
	fireEvent,
	waitFor
} from '@testing-library/react'
import {
	vi,
	it,
	describe,
	expect,
	beforeEach
} from 'vitest'

import { useFetch } from '../useFetch';

vi.mock('../services/NotificationService');
vi.mock('../../../http-service/src', () => ({
	QueueKingSystem: {
		add: vi.fn().mockImplementation((addCallback, removeCallback) => {
			const controller = new AbortController();
			addCallback(controller);
			return () => removeCallback(controller);
		}),
		isThresholdEnabled: true
	},
	isAbortedError: vi.fn().mockReturnValue(false)
}));

const fetchData = async () => {
	await (new Promise((resolve) => setTimeout(resolve, 10)));
	return 'fetched data';
}

describe('useFetch', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch data and set it correctly', async () => {
		const { result } = renderHook(() =>
			useFetch(fetchData, {
				initialState: '' 
			})
		);

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toBe('fetched data');
		expect(result.current.error).toBe(null);
	});

	it('should not fetch data when enable is false', () => {
		const { result } = renderHook(() =>
			useFetch(fetchData, {
				initialState: '',
				enable: false 
			})
		);

		expect(result.current.isLoading).toBe(false);
		expect(result.current.data).toBe('');
	});

	it('should set fetch state manually', async () => {
		const { result } = renderHook(() =>
			useFetch(fetchData, {
				initialState: '' 
			})
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		act(() => {
			result.current.setFetchState('manual data');
		});

		expect(result.current.data).toBe('manual data');
	});

	it('should handle silent mode correctly', async () => {
		const { result } = renderHook(() =>
			useFetch(fetchData, {
				initialState: '',
				silent: true
			})
		);

		expect(result.current.isLoading).toBe(false);

		await waitFor(() => {
			expect(result.current.data).toBe('fetched data');
		});
		expect(result.current.isLoading).toBe(false);

		expect(result.current.error).toBe(null);
	});

	it('should fetch data with dependencies', async () => {
		const { result, rerender } = renderHook(
			({ deps }) =>
				useFetch(fetchData, {
					initialState: '',
					deps
				}),
			{
				initialProps: {
					deps: [1] 
				}
			}
		);

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toBe('fetched data');

		rerender({
			deps: [2] 
		});

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toBe('fetched data');
	});

	/* it('should abort fetch on component unmount', async () => {
		const { result, unmount } = renderHook(() =>
			useFetch(fetchData, {
				initialState: ''
			})
		);

		expect(result.current.isLoading).toBe(true);

		unmount();

		// Expect the controller to have been aborted
		expect(QueueKingSystem.add).toHaveBeenCalled();
		expect(QueueKingSystem.add.mock.calls[0][0].signal.aborted).toBe(true);
	}); */

	it('should use different loading services', async () => {
		const { result } = renderHook(() =>
			useFetch(fetchData, {
				initialState: '',
				loadingService: 'customService'
			})
		);

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toBe('fetched data');
		expect(result.current.error).toBe(null);
		// You might want to add specific assertions to verify the use of custom loading service
	});

	it('should trigger fetch on window focus after 10 minutes', async () => {
		let value = 'First Fetch';

		const { result } = renderHook(() =>
			useFetch(() => Promise.resolve(value), {
				initialState: ''
			})
		);

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toBe('First Fetch');

		value = 'On Window focus Fetch';

		vi.useFakeTimers();
		fireEvent.blur(window);
		
		vi.advanceTimersByTime(10 * 60 * 1100);

		fireEvent.focus(window);
		vi.useRealTimers();

		await waitFor(() => {
			expect(result.current.data).toBe('On Window focus Fetch');
		});
	});
});

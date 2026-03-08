export const withTimeout = <T>(promise: Promise<T>, ms = 3000): Promise<T> =>
	Promise.race([
		promise,
		new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error('Timeout')), ms),
		),
	]);

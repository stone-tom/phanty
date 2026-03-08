export const withTimeout = <T>(promise: Promise<T>, ms = 3000): Promise<T> => {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => reject(new Error('Timeout')), ms);
	});
	return Promise.race<T | never>([promise, timeoutPromise]).finally(() => {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}
	}) as Promise<T>;
};

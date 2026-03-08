const IP_HEADERS = ['x-forwarded-for', 'x-real-ip'] as const;

export function getClientIp(request: Request): string | null {
	for (const header of IP_HEADERS) {
		const value = request.headers.get(header);
		if (value) {
			const [ip] = value.split(',');
			if (ip) {
				return ip.trim();
			}
		}
	}
	return null;
}

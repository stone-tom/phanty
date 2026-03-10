import { redirect } from '@tanstack/react-router';
import { authClient } from './auth-client';

async function getSessionUser() {
	const session = await authClient.getSession();
	return session.data?.user ?? null;
}

export async function requireAuthenticatedUser() {
	const user = await getSessionUser();

	if (!user) {
		throw redirect({ to: '/login' });
	}

	return user;
}

export async function redirectIfAuthenticated() {
	const user = await getSessionUser();

	if (user) {
		throw redirect({ to: '/' });
	}
}

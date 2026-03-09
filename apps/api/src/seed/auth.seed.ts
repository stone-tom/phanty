import { user } from '@repo/db';
import { eq } from 'drizzle-orm';
import { env } from '../env';
import { auth } from '../lib/auth';
import { db } from '../lib/db';

const seedUser = {
	name: env.SEED_AUTH_NAME,
	email: env.SEED_AUTH_EMAIL,
	password: env.SEED_AUTH_PASSWORD,
};

async function main() {
	const existingUser = await db.query.user.findFirst({
		where: eq(user.email, seedUser.email),
	});

	if (existingUser) {
		console.info(`Auth user already exists: ${seedUser.email}`);
		return;
	}

	await auth.api.signUpEmail({
		body: seedUser,
	});

	console.info(`Seeded auth user: ${seedUser.email}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

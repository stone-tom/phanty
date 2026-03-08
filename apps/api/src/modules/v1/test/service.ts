import Elysia from 'elysia';
import { db } from 'src/lib/db';

export class TestService {
	async findAll() {
		const data = await db.query.test.findMany();
		return data;
	}
	async findById(id: number) {
		const data = await db.query.test.findFirst({
			where: (test, { eq }) => eq(test.id, id),
		});
		return data;
	}
}

export const testService = new Elysia({ name: TestService.name }).decorate(
	'testService',
	new TestService(),
);

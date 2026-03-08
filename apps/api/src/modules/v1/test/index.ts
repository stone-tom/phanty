import Elysia, { t } from 'elysia';
import { testService } from './service';

export const test = new Elysia({ prefix: '/test' })
	.use(testService)
	.get('/', ({ testService }) => {
		return testService.findAll();
	})
	.get(
		'/:id',
		({ testService, params: { id } }) => {
			return testService.findById(id);
		},
		{
			params: t.Object({
				id: t.Number(),
			}),
		},
	);

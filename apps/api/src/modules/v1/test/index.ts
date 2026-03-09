import { Elysia, t } from 'elysia';
import { authPolicy } from '../../../plugins/auth';
import { testService } from './service';

export const test = new Elysia({ prefix: '/test' })
	.use(authPolicy)
	.use(testService)
	.guard(
		{
			auth: true,
		},
		(app) =>
			app
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
				),
	);

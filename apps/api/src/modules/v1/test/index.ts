import Elysia from 'elysia';
import { requestScope } from '../../../plugins/di';
import { TestService } from './service';

export const test = new Elysia({ prefix: '/test' })
  .use(requestScope)
  .get('/', ({ scope }) => {
    const service = scope.resolve(TestService);

    return service.findAll();
  })
  .get('/:id', ({ params }) => `Hello Test ${params.id}`);

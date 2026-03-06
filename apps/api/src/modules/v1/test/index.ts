import Elysia from 'elysia';
import { testService } from './service';

export const test = new Elysia({ prefix: '/test' })
  .use(testService)
  .get('/', ({ testService }) => {
    return testService.findAll();
  })
  .get('/:id', ({ testService }) => {
    return testService.findAll();
  });

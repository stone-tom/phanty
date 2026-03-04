import Elysia from 'elysia';

export const test = new Elysia({ prefix: '/test' })
  .get('/', () => 'Hello Test')
  .get('/:id', ({ params }) => `Hello Test ${params.id}`);

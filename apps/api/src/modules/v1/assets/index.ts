import Elysia from 'elysia';

export const assets = new Elysia({ prefix: '/assets' })
  .get('/', () => {
    return { id: "test" };
  })


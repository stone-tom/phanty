import Elysia from 'elysia';

export class Test2Service {
  async handleFindAll() {
    //await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

export const test2Service = new Elysia({ name: Test2Service.name }).decorate(
  'test2Service',
  new Test2Service(),
);

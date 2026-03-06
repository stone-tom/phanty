import Elysia from 'elysia';
import { type Test2Service, test2Service } from './service2';

export class TestService {
  constructor(
    private readonly test2Service: Test2Service,
  ) {}

  async findAll() {
    await this.test2Service.handleFindAll();
    return 'Hello Test from service';
  }
}

export const testService = new Elysia({ name: TestService.name })
  .use(test2Service)
  .decorate(({ test2Service }) => ({
    testService: new TestService(test2Service),
  }));

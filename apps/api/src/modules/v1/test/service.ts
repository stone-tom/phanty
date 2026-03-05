import { NotFoundError } from 'elysia';
import { RegisterService } from '../../../lib/di';

@RegisterService()
export class TestService {
  constructor() {
    console.log('TestService instantiated');
  }

  findAll() {
    throw new NotFoundError('This is a test error from TestService');
    return 'Hello Test from service';
  }
}

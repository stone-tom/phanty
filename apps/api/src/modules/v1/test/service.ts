import { RegisterService } from '../../../lib/di';

@RegisterService()
export class TestService {
  findAll() {
    return 'Hello Test';
  }
}
import Elysia from 'elysia';
import { test } from './test';

export const v1 = new Elysia({ prefix: '/v1' }).use(test);

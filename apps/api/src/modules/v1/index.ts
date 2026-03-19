import Elysia from 'elysia';
import { test } from './test';
import { assets } from './assets';

export const v1 = new Elysia({ prefix: '/v1' })
    .use(test)
    .use(assets);

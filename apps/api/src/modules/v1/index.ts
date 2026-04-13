import Elysia from 'elysia';
import { forms } from './forms';
import { projects } from './projects';

export const v1 = new Elysia({ prefix: '/v1' }).use(projects).use(forms);

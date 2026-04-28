import Elysia from 'elysia';
import { projects } from './projects';
import { templates } from './templates';

export const v1 = new Elysia({ prefix: '/v1' }).use(projects).use(templates);

import Elysia from 'elysia';
import { projects } from './projects';

export const v1 = new Elysia({ prefix: '/v1' }).use(projects);

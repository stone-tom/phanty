import Elysia from 'elysia';
import { organizations } from './organizations';
import { projects } from './projects';
import { templates } from './templates';

export const v1 = new Elysia({ prefix: '/v1' })
  .use(organizations)
  .use(projects)
  .use(templates);

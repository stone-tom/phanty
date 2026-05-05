import Elysia from 'elysia';
import { blocks } from './blocks';
import { organizations } from './organizations';
import { projects } from './projects';
import { templates } from './templates';

export const v1 = new Elysia({ prefix: '/v1' })
  .use(blocks)
  .use(organizations)
  .use(projects)
  .use(templates);

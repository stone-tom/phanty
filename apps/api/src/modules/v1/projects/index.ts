import Elysia from 'elysia';
import { betterAuth } from '../../../plugins/better-auth';
import { projectService } from './service';

export const projects = new Elysia({ prefix: '/projects' })
  .use(betterAuth)
  .use(projectService)
  .get(
    '/',
    ({ projectService, organization }) => {
      return projectService.findAll(organization.id);
    },
    { auth: true },
  );

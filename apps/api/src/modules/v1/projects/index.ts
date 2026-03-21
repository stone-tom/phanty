import Elysia, { NotFoundError, t } from 'elysia';
import { betterAuth } from '../../../plugins/better-auth';
import { ProjectOutput } from './model';
import { projectService } from './service';

export const projects = new Elysia({ prefix: '/projects' })
  .use(betterAuth)
  .use(projectService)
  .get(
    '/',
    ({ projectService, organization }) => {
      return projectService.findAll(organization.id);
    },
    { auth: true, response: t.Array(ProjectOutput) },
  )
  .get(
    '/:id',
    async ({ projectService, organization, params: { id } }) => {
      const project = await projectService.findById(id, organization.id);

      if (!project) {
        throw new NotFoundError('Project could not be found');
      }

      return project;
    },
    { auth: true, response: ProjectOutput },
  );

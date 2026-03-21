import Elysia, { NotFoundError, t } from 'elysia';
import { betterAuth } from '../../../plugins/better-auth';
import { CreateProjectInput, ProjectOutput, UpdateProjectInput } from './model';
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
  )
  .post(
    '/',
    ({ projectService, organization, body, member }) => {
      return projectService.create({
        ...body,
        createdById: member.id,
        organizationId: organization.id,
      });
    },
    { auth: true, response: ProjectOutput, body: CreateProjectInput },
  )
  .put(
    '/:id',
    async ({ projectService, organization, params: { id }, body }) => {
      const currentProject = await projectService.findById(id, organization.id);
      console.log(body);
      if (!currentProject) {
        throw new NotFoundError('Project could not be found');
      }

      return projectService.update(id, body, organization.id);
    },
    { auth: true, response: ProjectOutput, body: UpdateProjectInput },
  )
  .delete(
    '/:id',
    async ({ projectService, organization, set, params: { id } }) => {
      const currentProject = await projectService.findById(id, organization.id);

      if (!currentProject) {
        throw new NotFoundError('Project could not be found');
      }

      set.status = 204;

      return projectService.delete(id, organization.id);
    },
    { auth: true },
  );

import Elysia, { NotFoundError, t } from 'elysia';
import { betterAuth } from '../../../plugins/better-auth';
import { ErrorOutput } from '../../../plugins/error-handler';
import {
  CreateTemplateInput,
  HardDeleteTemplateQuery,
  ListTemplatesQuery,
  TemplateOutput,
  UpdateTemplateDocumentInput,
  UpdateTemplateInput,
} from './model';
import { TemplateDocumentValidationError, templateService } from './service';

export const templates = new Elysia({ prefix: '/templates' })
  .use(betterAuth)
  .use(templateService)
  .get(
    '/',
    async ({ templateService, organization, query }) => {
      const rows = await templateService.findAll(
        organization.id,
        query.status ?? 'active',
        query.type,
      );

      return rows;
    },
    {
      auth: true,
      response: {
        200: t.Array(TemplateOutput),
        401: ErrorOutput,
        422: ErrorOutput,
      },
      query: ListTemplatesQuery,
    },
  )
  .get(
    '/:id',
    async ({ templateService, organization, params: { id } }) => {
      const template = await templateService.findById(id, organization.id);

      if (!template) {
        throw new NotFoundError('Template could not be found');
      }

      return template;
    },
    {
      auth: true,
      response: {
        200: TemplateOutput,
        404: ErrorOutput,
        401: ErrorOutput,
        422: ErrorOutput,
      },
    },
  )
  .post(
    '/',
    async ({ templateService, organization, body, member }) => {
      const template = await templateService.create({
        ...body,
        createdById: member.id,
        organizationId: organization.id,
      });

      return template;
    },
    {
      auth: true,
      response: {
        200: TemplateOutput,
        401: ErrorOutput,
        422: ErrorOutput,
      },
      body: CreateTemplateInput,
    },
  )
  .put(
    '/:id',
    async ({ templateService, organization, params: { id }, body }) => {
      const currentTemplate = await templateService.findById(
        id,
        organization.id,
      );
      if (!currentTemplate) {
        throw new NotFoundError('Template could not be found');
      }

      const updatedTemplate = await templateService.update(
        id,
        body,
        organization.id,
      );

      if (!updatedTemplate) {
        throw new Error('Was not able to update template');
      }

      return updatedTemplate;
    },
    {
      auth: true,
      response: {
        200: TemplateOutput,
        404: ErrorOutput,
        401: ErrorOutput,
        422: ErrorOutput,
      },
      body: UpdateTemplateInput,
    },
  )
  .put(
    '/:id/document',
    async ({ templateService, organization, params: { id }, body, set }) => {
      try {
        const updatedTemplate = await templateService.updateDocument(
          id,
          body.document,
          organization.id,
        );

        if (!updatedTemplate) {
          throw new NotFoundError('Template could not be found');
        }

        return updatedTemplate;
      } catch (error) {
        if (error instanceof TemplateDocumentValidationError) {
          set.status = 422;
          throw error;
        }

        throw error;
      }
    },
    {
      auth: true,
      response: {
        200: TemplateOutput,
        404: ErrorOutput,
        401: ErrorOutput,
        422: ErrorOutput,
      },
      body: UpdateTemplateDocumentInput,
    },
  )
  .delete(
    '/:id',
    async ({ templateService, organization, set, params: { id } }) => {
      const currentTemplate = await templateService.findById(
        id,
        organization.id,
        {
          includeArchived: true,
        },
      );

      if (!currentTemplate) {
        throw new NotFoundError('Template could not be found');
      }

      set.status = 204;

      return templateService.softDelete(id, organization.id);
    },
    {
      auth: true,
      response: {
        204: t.Null(),
        404: ErrorOutput,
        401: ErrorOutput,
        422: ErrorOutput,
      },
    },
  )
  .delete(
    '/:id/hard',
    async ({ templateService, organization, params: { id }, query, set }) => {
      const currentTemplate = await templateService.findById(
        id,
        organization.id,
        {
          includeArchived: true,
        },
      );

      if (!currentTemplate) {
        throw new NotFoundError('Template could not be found');
      }

      const ifArchived = query.ifArchived ?? true;
      if (ifArchived && !currentTemplate.archivedAt) {
        set.status = 409;
        throw new Error(
          'Template must be archived before it can be hard deleted',
        );
      }

      set.status = 204;

      return templateService.hardDelete(id, organization.id);
    },
    {
      auth: true,
      response: {
        204: t.Null(),
        404: ErrorOutput,
        409: ErrorOutput,
        401: ErrorOutput,
        422: ErrorOutput,
      },
      query: HardDeleteTemplateQuery,
    },
  );

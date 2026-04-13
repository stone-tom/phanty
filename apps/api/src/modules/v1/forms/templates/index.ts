import Elysia, { NotFoundError, t } from 'elysia';
import { betterAuth } from '../../../../plugins/better-auth';
import { ErrorOutput } from '../../../../plugins/error-handler';
import {
  CreateFormTemplateInput,
  FormTemplateOutput,
  HardDeleteFormTemplateQuery,
  ListFormTemplatesQuery,
  UpdateFormTemplateInput,
} from './model';
import { formTemplateService } from './service';

export const templates = new Elysia({ prefix: '/templates' })
  .use(betterAuth)
  .use(formTemplateService)
  .get(
    '/',
    ({ formTemplateService, organization, query }) => {
      return formTemplateService.findAll(
        organization.id,
        query.status ?? 'active',
      );
    },
    {
      auth: true,
      response: {
        200: t.Array(FormTemplateOutput),
        401: ErrorOutput,
        422: ErrorOutput,
      },
      query: ListFormTemplatesQuery,
    },
  )
  .get(
    '/:id',
    async ({ formTemplateService, organization, params: { id } }) => {
      const formTemplate = await formTemplateService.findById(
        id,
        organization.id,
      );

      if (!formTemplate) {
        throw new NotFoundError('Form template could not be found');
      }

      return formTemplate;
    },
    {
      auth: true,
      response: {
        200: FormTemplateOutput,
        404: ErrorOutput,
        401: ErrorOutput,
        422: ErrorOutput,
      },
    },
  )
  .post(
    '/',
    ({ formTemplateService, organization, body, member }) => {
      return formTemplateService.create({
        ...body,
        createdById: member.id,
        organizationId: organization.id,
      });
    },
    {
      auth: true,
      response: {
        200: FormTemplateOutput,
        401: ErrorOutput,
        422: ErrorOutput,
      },
      body: CreateFormTemplateInput,
    },
  )
  .put(
    '/:id',
    async ({ formTemplateService, organization, params: { id }, body }) => {
      const currentFormTemplate = await formTemplateService.findById(
        id,
        organization.id,
      );
      if (!currentFormTemplate) {
        throw new NotFoundError('Form template could not be found');
      }

      const updatedFormTemplate = await formTemplateService.update(
        id,
        body,
        organization.id,
      );

      if (!updatedFormTemplate) {
        throw new Error('Was not able to update form template');
      }

      return updatedFormTemplate;
    },
    {
      auth: true,
      response: {
        200: FormTemplateOutput,
        404: ErrorOutput,
        401: ErrorOutput,
        422: ErrorOutput,
      },
      body: UpdateFormTemplateInput,
    },
  )
  .delete(
    '/:id',
    async ({ formTemplateService, organization, set, params: { id } }) => {
      const currentFormTemplate = await formTemplateService.findById(
        id,
        organization.id,
        {
          includeArchived: true,
        },
      );

      if (!currentFormTemplate) {
        throw new NotFoundError('Form template could not be found');
      }

      set.status = 204;

      return formTemplateService.softDelete(id, organization.id);
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
    async ({
      formTemplateService,
      organization,
      params: { id },
      query,
      set,
    }) => {
      const currentFormTemplate = await formTemplateService.findById(
        id,
        organization.id,
        {
          includeArchived: true,
        },
      );

      if (!currentFormTemplate) {
        throw new NotFoundError('Form template could not be found');
      }

      const ifArchived = query.ifArchived ?? true;
      if (ifArchived && !currentFormTemplate.archivedAt) {
        set.status = 409;
        throw new Error(
          'Form template must be archived before it can be hard deleted',
        );
      }

      set.status = 204;

      return formTemplateService.hardDelete(id, organization.id);
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
      query: HardDeleteFormTemplateQuery,
    },
  );

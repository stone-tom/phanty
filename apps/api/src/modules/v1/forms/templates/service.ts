import { formTemplate } from '@repo/db/schema';
import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import Elysia from 'elysia';
import { db } from '../../../../lib/db';

export type FormTemplateListStatus = 'active' | 'archived' | 'all';

export interface CreateFormTemplatePayload {
  name: string;
  description?: string | null;
  organizationId: string;
  createdById: string;
}

export interface UpdateFormTemplatePayload
  extends Partial<
    Omit<CreateFormTemplatePayload, 'organizationId' | 'createdById'>
  > {}

export class FormTemplateService {
  private readonly with = {
    createdBy: {
      with: {
        user: true,
      },
    },
  } as const;

  private buildListWhere(
    organizationId: string,
    status: FormTemplateListStatus,
  ) {
    if (status === 'archived') {
      return and(
        eq(formTemplate.organizationId, organizationId),
        isNotNull(formTemplate.archivedAt),
      );
    }

    if (status === 'all') {
      return eq(formTemplate.organizationId, organizationId);
    }

    return and(
      eq(formTemplate.organizationId, organizationId),
      isNull(formTemplate.archivedAt),
    );
  }

  async findAll(
    organizationId: string,
    status: FormTemplateListStatus = 'active',
  ) {
    return db.query.formTemplate.findMany({
      where: this.buildListWhere(organizationId, status),
      with: this.with,
      orderBy: [desc(formTemplate.updatedAt)],
    });
  }

  async findById(
    id: string,
    organizationId: string,
    options?: { includeArchived?: boolean },
  ) {
    const includeArchived = options?.includeArchived ?? false;

    return db.query.formTemplate.findFirst({
      where: and(
        eq(formTemplate.id, id),
        eq(formTemplate.organizationId, organizationId),
        ...(includeArchived ? [] : [isNull(formTemplate.archivedAt)]),
      ),
      with: this.with,
    });
  }

  async create(input: CreateFormTemplatePayload) {
    const [createdFormTemplate] = await db
      .insert(formTemplate)
      .values(input)
      .returning();

    if (!createdFormTemplate) {
      throw new Error('Was not able to create a new form template');
    }

    const currentFormTemplate = await this.findById(
      createdFormTemplate.id,
      input.organizationId,
      { includeArchived: true },
    );

    if (!currentFormTemplate) {
      throw new Error('Was not able to create a new form template');
    }

    return currentFormTemplate;
  }

  async update(
    id: string,
    input: UpdateFormTemplatePayload,
    organizationId: string,
  ) {
    const [updatedFormTemplate] = await db
      .update(formTemplate)
      .set(input)
      .where(
        and(
          eq(formTemplate.id, id),
          eq(formTemplate.organizationId, organizationId),
          isNull(formTemplate.archivedAt),
        ),
      )
      .returning();

    if (!updatedFormTemplate) {
      return null;
    }

    return this.findById(updatedFormTemplate.id, organizationId, {
      includeArchived: true,
    });
  }

  async softDelete(id: string, organizationId: string) {
    await db
      .update(formTemplate)
      .set({ archivedAt: new Date() })
      .where(
        and(
          eq(formTemplate.id, id),
          eq(formTemplate.organizationId, organizationId),
          isNull(formTemplate.archivedAt),
        ),
      );

    return null;
  }

  async hardDelete(id: string, organizationId: string) {
    await db
      .delete(formTemplate)
      .where(
        and(
          eq(formTemplate.id, id),
          eq(formTemplate.organizationId, organizationId),
        ),
      );

    return null;
  }
}

export const formTemplateService = new Elysia({
  name: FormTemplateService.name,
}).decorate('formTemplateService', new FormTemplateService());

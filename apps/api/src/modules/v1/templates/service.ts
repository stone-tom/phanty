import { template } from '@repo/db/schema';
import {
  createDefaultTemplateDocument,
  type TemplateType,
  validateTemplateDocument,
} from '@repo/templates';
import { randomUUIDv7 } from 'bun';
import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import Elysia from 'elysia';
import { db } from '../../../lib/db';
import { validateOrganizationBlockAccess } from '../blocks/access-validation';

export type TemplateListStatus = 'active' | 'archived' | 'all';

export interface CreateTemplatePayload {
  type: 'form';
  name: string;
  description?: string | null;
  organizationId: string;
  createdById: string;
}

export interface UpdateTemplatePayload
  extends Partial<Pick<CreateTemplatePayload, 'name' | 'description'>> {}

export class TemplateDocumentValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super(errors.join('\n'));
    this.errors = errors;
    this.name = TemplateDocumentValidationError.name;
  }
}

export class TemplateService {
  private readonly with = {
    createdBy: {
      with: {
        user: true,
      },
    },
  } as const;

  private buildListWhere(
    organizationId: string,
    status: TemplateListStatus,
    type?: TemplateType,
  ) {
    const predicates = [eq(template.organizationId, organizationId)];

    if (type) {
      predicates.push(eq(template.type, type));
    }

    if (status === 'archived') {
      predicates.push(isNotNull(template.archivedAt));
    } else if (status === 'active') {
      predicates.push(isNull(template.archivedAt));
    }

    return and(...predicates);
  }

  async findAll(
    organizationId: string,
    status: TemplateListStatus = 'active',
    type?: TemplateType,
  ) {
    return db.query.template.findMany({
      where: this.buildListWhere(organizationId, status, type),
      with: this.with,
      orderBy: [desc(template.updatedAt)],
    });
  }

  async findById(
    id: string,
    organizationId: string,
    options?: { includeArchived?: boolean },
  ) {
    const includeArchived = options?.includeArchived ?? false;

    return db.query.template.findFirst({
      where: and(
        eq(template.id, id),
        eq(template.organizationId, organizationId),
        ...(includeArchived ? [] : [isNull(template.archivedAt)]),
      ),
      with: this.with,
    });
  }

  async create(input: CreateTemplatePayload) {
    const [createdTemplate] = await db
      .insert(template)
      .values({
        ...input,
        document: createDefaultTemplateDocument(input.type, {
          createBlockId: randomUUIDv7,
        }),
      })
      .returning();

    if (!createdTemplate) {
      throw new Error('Was not able to create a new template');
    }

    const currentTemplate = await this.findById(
      createdTemplate.id,
      input.organizationId,
      { includeArchived: true },
    );

    if (!currentTemplate) {
      throw new Error('Was not able to create a new template');
    }

    return currentTemplate;
  }

  async update(
    id: string,
    input: UpdateTemplatePayload,
    organizationId: string,
  ) {
    const [updatedTemplate] = await db
      .update(template)
      .set(input)
      .where(
        and(
          eq(template.id, id),
          eq(template.organizationId, organizationId),
          isNull(template.archivedAt),
        ),
      )
      .returning();

    if (!updatedTemplate) {
      return null;
    }

    return this.findById(updatedTemplate.id, organizationId, {
      includeArchived: true,
    });
  }

  async updateDocument(id: string, input: unknown, organizationId: string) {
    const currentTemplate = await this.findById(id, organizationId);

    if (!currentTemplate) {
      return null;
    }

    const validation = validateTemplateDocument(input, currentTemplate.type);

    if (!validation.success) {
      throw new TemplateDocumentValidationError(validation.errors);
    }

    // TODO: Keep an eye on save performance as the block catalog grows.
    // for now it is good to have strict validation. Lets see how often we run into that.
    const blockAccessErrors = await validateOrganizationBlockAccess(
      organizationId,
      validation.document,
    );

    if (blockAccessErrors.length > 0) {
      throw new TemplateDocumentValidationError(blockAccessErrors);
    }

    const [updatedTemplate] = await db
      .update(template)
      .set({ document: validation.document })
      .where(
        and(
          eq(template.id, id),
          eq(template.organizationId, organizationId),
          isNull(template.archivedAt),
        ),
      )
      .returning();

    if (!updatedTemplate) {
      return null;
    }

    return this.findById(updatedTemplate.id, organizationId, {
      includeArchived: true,
    });
  }

  async softDelete(id: string, organizationId: string) {
    await db
      .update(template)
      .set({ archivedAt: new Date() })
      .where(
        and(
          eq(template.id, id),
          eq(template.organizationId, organizationId),
          isNull(template.archivedAt),
        ),
      );

    return null;
  }

  async hardDelete(id: string, organizationId: string) {
    await db
      .delete(template)
      .where(
        and(eq(template.id, id), eq(template.organizationId, organizationId)),
      );

    return null;
  }
}

export const templateService = new Elysia({
  name: TemplateService.name,
}).decorate('templateService', new TemplateService());

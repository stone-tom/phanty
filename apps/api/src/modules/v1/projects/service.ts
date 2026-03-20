import { project } from '@repo/db/schema';
import { and, eq } from 'drizzle-orm';
import Elysia from 'elysia';
import { db } from '../../../lib/db';

export interface CreateProjectPayload {
  name: string;
  description?: string;
  organizationId: string;
  createdBy: string;
}

export interface UpdateProjectPayload
  extends Partial<Omit<CreateProjectPayload, 'organizationId' | 'createdBy'>> {}

export class ProjectService {
  async findAll(organizationId: string) {
    return db.query.project.findMany({
      where: eq(project.organizationId, organizationId),
    });
  }

  async findById(id: string, organizationId: string) {
    return db.query.project.findMany({
      where: and(
        eq(project.id, id),
        eq(project.organizationId, organizationId),
      ),
    });
  }

  async create(input: CreateProjectPayload) {
    return db.insert(project).values(input).returning();
  }

  async update(
    id: string,
    input: UpdateProjectPayload,
    organizationId: string,
  ) {
    return db
      .update(project)
      .set(input)
      .where(
        and(eq(project.id, id), eq(project.organizationId, organizationId)),
      )
      .returning();
  }
}

export const projectService = new Elysia({
  name: ProjectService.name,
}).decorate('projectService', new ProjectService());

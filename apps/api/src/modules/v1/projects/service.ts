import { project } from '@repo/db/schema';
import { and, eq } from 'drizzle-orm';
import Elysia from 'elysia';
import { db } from '../../../lib/db';

export interface CreateProjectPayload {
  name: string;
  description?: string | null;
  organizationId: string;
  createdById: string;
}

export interface UpdateProjectPayload
  extends Partial<Omit<CreateProjectPayload, 'organizationId' | 'createdBy'>> {}

// TODO: optimize: i dont like these wierd checks in create and update
// should we connect by user id or member id????
export class ProjectService {
  private readonly with = {
    createdBy: {
      with: {
        user: true,
      },
    },
  } as const;

  async findAll(organizationId: string) {
    return db.query.project.findMany({
      where: eq(project.organizationId, organizationId),
      with: this.with,
    });
  }

  async findById(id: string, organizationId: string) {
    return db.query.project.findFirst({
      where: and(
        eq(project.id, id),
        eq(project.organizationId, organizationId),
      ),
      with: this.with,
    });
  }

  async create(input: CreateProjectPayload) {
    const [createdProject] = await db.insert(project).values(input).returning();

    if (!createdProject) {
      throw new Error('Was not able to create a new project');
    }

    const currentProject = await this.findById(
      createdProject.id,
      input.organizationId,
    );

    if (!currentProject) {
      throw new Error('Was not able to create a new project');
    }

    return currentProject;
  }

  async update(
    id: string,
    input: UpdateProjectPayload,
    organizationId: string,
  ) {
    const [updatedProject] = await db
      .update(project)
      .set(input)
      .where(
        and(eq(project.id, id), eq(project.organizationId, organizationId)),
      )
      .returning();

    if (!updatedProject) {
      throw new Error('Was not able to update the project');
    }

    const currentProject = await this.findById(
      updatedProject.id,
      organizationId,
    );

    if (!currentProject) {
      throw new Error('Was not able to update the project');
    }

    return currentProject;
  }

  async delete(id: string, organizationId: string) {
    await db
      .delete(project)
      .where(
        and(eq(project.id, id), eq(project.organizationId, organizationId)),
      );

    return null;
  }
}

export const projectService = new Elysia({
  name: ProjectService.name,
}).decorate('projectService', new ProjectService());

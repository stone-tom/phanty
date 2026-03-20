import Elysia from 'elysia';
import { projectService } from './service';

export const projects = new Elysia({ prefix: '/projects' }).use(projectService);

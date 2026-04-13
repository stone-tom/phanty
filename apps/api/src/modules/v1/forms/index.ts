import Elysia from 'elysia';
import { templates } from './templates';

export const forms = new Elysia({ prefix: '/forms' }).use(templates);

import { z } from 'zod';
import { nonEmpty, optionalDate, pagination } from './common';

const statusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);
const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

const base = z.object({
  name: nonEmpty('Task name'),
  description: z.string().trim().max(2000).nullable().optional(),
  priority: priorityEnum.default('MEDIUM'),
  status: statusEnum.default('PENDING'),
  dueDate: optionalDate,
});

export const createTaskSchema = base.extend({ projectId: z.string().uuid('Invalid project id') });
export const updateTaskSchema = base.partial();

export const listTasksQuery = z.object({
  search: z.string().trim().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  projectId: z.string().uuid().optional(),
  ...pagination,
});

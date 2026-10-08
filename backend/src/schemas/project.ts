import { z } from 'zod';
import { nonEmpty, optionalDate, pagination } from './common';

const statusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);

const base = z.object({
  name: nonEmpty('Project name'),
  description: z.string().trim().max(2000).nullable().optional(),
  status: statusEnum.default('NOT_STARTED'),
  startDate: optionalDate,
  endDate: optionalDate,
});

const datesInOrder = (d: { startDate?: Date | null; endDate?: Date | null }) =>
  !d.startDate || !d.endDate || d.endDate >= d.startDate;
const dateError = { message: 'End date cannot be before start date', path: ['endDate'] };

export const createProjectSchema = base.refine(datesInOrder, dateError);
export const updateProjectSchema = base.partial().refine(datesInOrder, dateError);

export const listProjectsQuery = z.object({
  search: z.string().trim().optional(),
  status: statusEnum.optional(),
  ...pagination,
});

import { z } from 'zod';

export const idParam = z.object({ id: z.string().uuid('Invalid id') });

export const nonEmpty = (label: string, max = 200) =>
  z.string({ required_error: `${label} is required` }).trim().min(1, `${label} cannot be empty`).max(max);

export const dateString = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date')
  .transform((v) => new Date(v));

export const optionalDate = dateString.nullable().optional();

export const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

import { z } from 'zod';
import { nonEmpty } from './common';

export const registerSchema = z.object({
  fullName: nonEmpty('Full name', 100),
  email: z.string({ required_error: 'Email is required' }).trim().toLowerCase().email('Invalid email address').max(254),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters')
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).trim().toLowerCase().email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

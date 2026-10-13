import { z } from 'zod';
import { PRIORITIES } from './constants';

export const createTicketSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value || null),
  priority: z.enum(PRIORITIES).default('medium'),
});

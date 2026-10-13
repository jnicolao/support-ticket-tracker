import { z } from 'zod';
import { PRIORITIES, STATUSES } from './constants';

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

export const listTicketsQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

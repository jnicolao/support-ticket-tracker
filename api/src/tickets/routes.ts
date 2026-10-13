import { Router } from 'express';
import { pool } from '../db';
import { Ticket } from './constants';
import { createTicketSchema } from './schemas';

export const ticketsRouter = Router();

ticketsRouter.post('/', async (req, res) => {
  const input = createTicketSchema.parse(req.body);
  const { rows } = await pool.query<Ticket>(
    `INSERT INTO tickets (title, description, priority)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.title, input.description, input.priority],
  );
  res.status(201).json(rows[0]);
});

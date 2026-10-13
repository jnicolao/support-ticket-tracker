import { Router } from 'express';
import { pool } from '../db';
import { Ticket } from './constants';
import { createTicketSchema, listTicketsQuerySchema } from './schemas';

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

ticketsRouter.get('/', async (req, res) => {
  const { status, page, limit } = listTicketsQuerySchema.parse(req.query);
  const where = status ? 'WHERE status = $1' : '';
  const filterParams = status ? [status] : [];
  const n = filterParams.length;

  const countResult = await pool.query<{ total: number }>(
    `SELECT count(*)::int AS total FROM tickets ${where}`,
    filterParams,
  );
  const total = countResult.rows[0].total;

  const { rows } = await pool.query<Ticket>(
    `SELECT * FROM tickets ${where}
     ORDER BY created_at DESC, id DESC
     LIMIT $${n + 1} OFFSET $${n + 2}`,
    [...filterParams, limit, (page - 1) * limit],
  );

  res.json({
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

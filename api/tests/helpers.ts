import { pool } from '../src/db';
import { Priority, Status, Ticket } from '../src/tickets/constants';

export async function insertTicket(
  fields: { title?: string; status?: Status; priority?: Priority } = {},
) {
  const { rows } = await pool.query<Ticket>(
    `INSERT INTO tickets (title, status, priority)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [fields.title ?? 'Ticket', fields.status ?? 'open', fields.priority ?? 'medium'],
  );
  return rows[0];
}

import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { pool } from '../src/db';
import { insertTicket } from './helpers';

describe('DELETE /tickets/:id', () => {
  it('deletes the ticket and leaves the others', async () => {
    const kept = await insertTicket({ title: 'Keep me' });
    const removed = await insertTicket({ title: 'Remove me' });

    const res = await request(app).delete(`/tickets/${removed.id}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});

    const { rows } = await pool.query('SELECT id FROM tickets');
    expect(rows).toEqual([{ id: kept.id }]);
  });

  it('rejects a non-integer id with 400', async () => {
    const res = await request(app).delete('/tickets/abc');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).delete('/tickets/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { message: 'Ticket not found' } });
  });
});

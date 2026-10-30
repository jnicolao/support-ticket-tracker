import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { pool } from '../src/db';
import { insertTicket } from './helpers';

describe('PATCH /tickets/:id', () => {
  it('updates status and priority independently and persists them', async () => {
    const ticket = await insertTicket({ title: 'Fix wifi' });

    const closed = await request(app).patch(`/tickets/${ticket.id}`).send({ status: 'closed' });
    expect(closed.status).toBe(200);
    expect(closed.body).toEqual({
      ...ticket,
      status: 'closed',
      created_at: ticket.created_at.toISOString(),
      updated_at: expect.any(String),
    });
    expect(new Date(closed.body.updated_at) > ticket.updated_at).toBe(true);

    const high = await request(app).patch(`/tickets/${ticket.id}`).send({ priority: 'high' });
    expect(high.status).toBe(200);
    expect(high.body).toMatchObject({ status: 'closed', priority: 'high' });

    const { rows } = await pool.query('SELECT status, priority FROM tickets WHERE id = $1', [
      ticket.id,
    ]);
    expect(rows[0]).toEqual({ status: 'closed', priority: 'high' });
  });

  it.each([
    ['an invalid status', '1', { status: 'done' }],
    ['an empty body', '1', {}],
    ['a field that cannot be edited', '1', { title: 'New title' }],
    ['a non-integer id', 'abc', { status: 'closed' }],
  ])('rejects %s with 400', async (_name, id, body) => {
    await insertTicket();

    const res = await request(app).patch(`/tickets/${id}`).send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).patch('/tickets/999').send({ status: 'closed' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { message: 'Ticket not found' } });
  });
});

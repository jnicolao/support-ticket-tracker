import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { insertTicket } from './helpers';

describe('GET /tickets/:id', () => {
  it('returns the ticket', async () => {
    const ticket = await insertTicket({ title: 'Fix wifi', priority: 'high' });

    const res = await request(app).get(`/tickets/${ticket.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ...ticket,
      created_at: ticket.created_at.toISOString(),
      updated_at: ticket.updated_at.toISOString(),
    });
  });

  it('rejects a non-integer id with 400', async () => {
    const res = await request(app).get('/tickets/abc');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/tickets/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { message: 'Ticket not found' } });
  });
});

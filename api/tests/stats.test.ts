import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { insertTicket } from './helpers';

describe('GET /tickets/stats', () => {
  it('returns every status as a number, including zeros, and reflects updates', async () => {
    const empty = await request(app).get('/tickets/stats');
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual({ open: 0, in_progress: 0, closed: 0 });

    const first = await insertTicket();
    await insertTicket();
    await request(app).patch(`/tickets/${first.id}`).send({ status: 'closed' });

    const res = await request(app).get('/tickets/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ open: 1, in_progress: 0, closed: 1 });
  });
});

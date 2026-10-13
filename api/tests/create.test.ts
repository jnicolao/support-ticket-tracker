import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { pool } from '../src/db';

describe('POST /tickets', () => {
  it('creates a ticket with defaults applied and persists it', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({ title: '  Printer jammed  ', description: '   ' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      title: 'Printer jammed',
      description: null,
      status: 'open',
      priority: 'medium',
      created_at: expect.any(String),
    });
    expect(new Date(res.body.created_at).toISOString()).toBe(res.body.created_at);

    const { rows } = await pool.query('SELECT * FROM tickets');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 1,
      title: 'Printer jammed',
      description: null,
      status: 'open',
      priority: 'medium',
    });
  });

  it('stores the given description and priority', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({ title: 'VPN down', description: 'Since 9am', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ description: 'Since 9am', priority: 'high', status: 'open' });
  });

  it.each([
    ['missing title', {}, 'title'],
    ['blank title', { title: '   ' }, 'title'],
    ['title over 200 characters', { title: 'x'.repeat(201) }, 'title'],
    ['invalid priority', { title: 'Ok', priority: 'urgent' }, 'priority'],
    ['unknown field', { title: 'Ok', status: 'closed' }, ''],
  ])('rejects %s with 400', async (_name, body, path) => {
    const res = await request(app).post('/tickets').send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
    expect(res.body.error.details).toContainEqual({ path, message: expect.any(String) });

    const { rows } = await pool.query('SELECT count(*)::int AS count FROM tickets');
    expect(rows[0].count).toBe(0);
  });
});

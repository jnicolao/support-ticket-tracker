import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { Ticket } from '../src/tickets/constants';
import { insertTicket } from './helpers';

const ids = (body: { data: Ticket[] }) => body.data.map((ticket) => ticket.id);

describe('GET /tickets', () => {
  it('filters by status and paginates newest first', async () => {
    const open1 = await insertTicket({ title: 'Open 1' });
    await insertTicket({ title: 'Closed 1', status: 'closed' });
    const open2 = await insertTicket({ title: 'Open 2' });
    await insertTicket({ title: 'Closed 2', status: 'closed' });
    const open3 = await insertTicket({ title: 'Open 3' });

    const page1 = await request(app).get('/tickets?status=open&limit=2');
    expect(page1.status).toBe(200);
    expect(ids(page1.body)).toEqual([open3.id, open2.id]);
    expect(page1.body.data[0]).toEqual({
      ...open3,
      created_at: open3.created_at.toISOString(),
      updated_at: open3.updated_at.toISOString(),
    });
    expect(page1.body.pagination).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });

    const page2 = await request(app).get('/tickets?status=open&limit=2&page=2');
    expect(ids(page2.body)).toEqual([open1.id]);
    expect(page2.body.pagination).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });

    const page3 = await request(app).get('/tickets?status=open&limit=2&page=3');
    expect(page3.status).toBe(200);
    expect(page3.body.data).toEqual([]);

    const unfiltered = await request(app).get('/tickets');
    expect(unfiltered.body.data).toHaveLength(5);
    expect(unfiltered.body.pagination).toEqual({ page: 1, limit: 20, total: 5, totalPages: 1 });
  });

  it.each(['status=bogus', 'page=0', 'page=abc', 'limit=0', 'limit=101'])(
    'rejects ?%s with 400',
    async (query) => {
      const res = await request(app).get(`/tickets?${query}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Validation failed');
      expect(res.body.error.details.length).toBeGreaterThan(0);
    },
  );
});

import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';

describe('error handling', () => {
  it('rejects a malformed JSON body with the standard error shape', async () => {
    const res = await request(app)
      .post('/tickets')
      .set('Content-Type', 'application/json')
      .send('{"title": ');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { message: 'Malformed JSON body' } });
  });
});

import { TicketPage } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface ErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details: ErrorDetail[] = [],
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = await res.json();
  if (!res.ok) {
    throw new ApiError(res.status, body.error.message, body.error.details);
  }
  return body;
}

export function listTickets(page: number, limit: number) {
  return request<TicketPage>(`/tickets?page=${page}&limit=${limit}`);
}

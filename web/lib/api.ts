import { Priority, Stats, Status, Ticket, TicketChanges, TicketPage } from './types';

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

export function listTickets(page: number, limit: number, status: Status | null) {
  const filter = status ? `&status=${status}` : '';
  return request<TicketPage>(`/tickets?page=${page}&limit=${limit}${filter}`);
}

export function getStats() {
  return request<Stats>('/tickets/stats');
}

export function createTicket(input: { title: string; description: string; priority: Priority }) {
  return request<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(input) });
}

export function updateTicket(id: number, changes: TicketChanges) {
  return request<Ticket>(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
}

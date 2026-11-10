'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getTicket } from '@/lib/api';
import { STATUS_LABELS, Ticket } from '@/lib/types';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTicket(id)
      .then(setTicket)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        Back to tickets
      </Link>

      {error && (
        <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      {!ticket && !error && (
        <p role="status" className="mt-4 text-gray-500">
          Loading ticket...
        </p>
      )}

      {ticket && (
        <article className="mt-4 rounded border p-4">
          <h1 className="text-2xl font-semibold">{ticket.title}</h1>
          <p className="mt-2 whitespace-pre-wrap text-gray-700">
            {ticket.description ?? 'No description.'}
          </p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-gray-500">Status</dt>
            <dd>{STATUS_LABELS[ticket.status]}</dd>
            <dt className="text-gray-500">Priority</dt>
            <dd className="capitalize">{ticket.priority}</dd>
            <dt className="text-gray-500">Created</dt>
            <dd>{new Date(ticket.created_at).toLocaleString()}</dd>
            <dt className="text-gray-500">Updated</dt>
            <dd>{new Date(ticket.updated_at).toLocaleString()}</dd>
          </dl>
        </article>
      )}
    </main>
  );
}

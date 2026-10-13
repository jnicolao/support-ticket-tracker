'use client';

import { useEffect, useState } from 'react';
import CreateTicketForm from '@/components/CreateTicketForm';
import TicketTable from '@/components/TicketTable';
import { listTickets, updateTicketStatus } from '@/lib/api';
import { Status, TicketPage } from '@/lib/types';

const PAGE_SIZE = 10;

export default function Home() {
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tickets, setTickets] = useState<TicketPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTickets(page, PAGE_SIZE)
      .then((result) => {
        setTickets(result);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, refreshKey]);

  function load(next: number) {
    setLoading(true);
    setPage(next);
    setRefreshKey((key) => key + 1);
  }

  async function changeStatus(id: number, status: Status) {
    try {
      await updateTicketStatus(id, status);
      load(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  const pagination = tickets?.pagination;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Tickets</h1>

      <CreateTicketForm onCreated={() => load(1)} />

      {error && (
        <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      {loading && !tickets && (
        <p role="status" className="mt-4 text-gray-500">
          Loading tickets...
        </p>
      )}

      {tickets && pagination && (
        <>
          <TicketTable tickets={tickets.data} onStatusChange={changeStatus} />
          <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => load(pagination.page - 1)}
              disabled={loading || pagination.page <= 1}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-500">
              Page {pagination.page} of {Math.max(pagination.totalPages, 1)} ({pagination.total}{' '}
              tickets)
            </span>
            <button
              type="button"
              onClick={() => load(pagination.page + 1)}
              disabled={loading || pagination.page >= pagination.totalPages}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </>
      )}
    </main>
  );
}

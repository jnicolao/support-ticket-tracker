'use client';

import { useEffect, useState } from 'react';
import CreateTicketForm from '@/components/CreateTicketForm';
import StatusFilter from '@/components/StatusFilter';
import TicketTable from '@/components/TicketTable';
import { getStats, listTickets, updateTicket } from '@/lib/api';
import { STATUS_LABELS, Stats, Status, TicketChanges, TicketPage } from '@/lib/types';

const PAGE_SIZE = 10;

export default function Home() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tickets, setTickets] = useState<TicketPage | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listTickets(page, PAGE_SIZE, status), getStats()])
      .then(([result, counts]) => {
        if (result.data.length === 0 && page > 1) {
          setPage(Math.max(result.pagination.totalPages, 1));
          return;
        }
        setTickets(result);
        setStats(counts);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, status, refreshKey]);

  function load(next: number) {
    setLoading(true);
    setPage(next);
    setRefreshKey((key) => key + 1);
  }

  function filterBy(next: Status | null) {
    setStatus(next);
    load(1);
  }

  async function changeTicket(id: number, changes: TicketChanges) {
    try {
      await updateTicket(id, changes);
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

      <StatusFilter value={status} stats={stats} onChange={filterBy} />

      {tickets && pagination && (
        <>
          <TicketTable
            tickets={tickets.data}
            emptyMessage={
              status ? `No ${STATUS_LABELS[status].toLowerCase()} tickets.` : 'No tickets yet.'
            }
            onChange={changeTicket}
          />
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
              {pagination.total === 1 ? 'ticket' : 'tickets'})
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

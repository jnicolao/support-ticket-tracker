import { Priority, STATUSES, STATUS_LABELS, Status, Ticket } from '@/lib/types';

const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'text-green-700',
  medium: 'text-yellow-600',
  high: 'text-red-700',
};

export default function TicketTable({
  tickets,
  onStatusChange,
}: {
  tickets: Ticket[];
  onStatusChange: (id: number, status: Status) => void;
}) {
  if (tickets.length === 0) {
    return <p className="mt-4 text-gray-500">No tickets yet.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-gray-50 text-gray-500">
          <tr>
            <th className="px-3 py-2 font-medium">Title</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Priority</th>
            <th className="px-3 py-2 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="align-top">
              <td className="px-3 py-2">
                <div className="font-medium">{ticket.title}</div>
                {ticket.description && <div className="text-gray-500">{ticket.description}</div>}
              </td>
              <td className="px-3 py-2">
                <select
                  value={ticket.status}
                  onChange={(event) => onStatusChange(ticket.id, event.target.value as Status)}
                  className="rounded border px-2 py-1"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <span className={`capitalize ${PRIORITY_STYLES[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                {new Date(ticket.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

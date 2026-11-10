import {
  PRIORITIES,
  Priority,
  STATUSES,
  STATUS_LABELS,
  Status,
  Ticket,
  TicketChanges,
} from '@/lib/types';

const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'text-green-700',
  medium: 'text-yellow-700',
  high: 'text-red-700',
};

export default function TicketTable({
  tickets,
  onChange,
}: {
  tickets: Ticket[];
  onChange: (id: number, changes: TicketChanges) => void;
}) {
  if (tickets.length === 0) {
    return <p className="mt-4 text-gray-500">No tickets yet.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-gray-50 text-gray-500">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              Title
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Status
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Priority
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Created
            </th>
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
                  aria-label={`Status of ${ticket.title}`}
                  value={ticket.status}
                  onChange={(event) => onChange(ticket.id, { status: event.target.value as Status })}
                  className="select rounded border py-1 pr-8 pl-2"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <select
                  aria-label={`Priority of ${ticket.title}`}
                  value={ticket.priority}
                  onChange={(event) =>
                    onChange(ticket.id, { priority: event.target.value as Priority })
                  }
                  className={`select rounded border py-1 pr-8 pl-2 capitalize ${PRIORITY_STYLES[ticket.priority]}`}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
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

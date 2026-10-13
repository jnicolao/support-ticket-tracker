import { Priority, STATUS_LABELS, Ticket } from '@/lib/types';

const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

export default function TicketTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return <p className="mt-4 text-gray-500">No tickets yet.</p>;
  }

  return (
    <table className="mt-4 w-full text-left text-sm">
      <thead className="border-b text-gray-500">
        <tr>
          <th className="py-2 pr-4 font-medium">Title</th>
          <th className="py-2 pr-4 font-medium">Status</th>
          <th className="py-2 pr-4 font-medium">Priority</th>
          <th className="py-2 font-medium">Created</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr key={ticket.id} className="border-b align-top">
            <td className="py-2 pr-4">
              <div className="font-medium">{ticket.title}</div>
              {ticket.description && <div className="text-gray-500">{ticket.description}</div>}
            </td>
            <td className="py-2 pr-4">{STATUS_LABELS[ticket.status]}</td>
            <td className="py-2 pr-4">
              <span className={`rounded px-2 py-0.5 capitalize ${PRIORITY_STYLES[ticket.priority]}`}>
                {ticket.priority}
              </span>
            </td>
            <td className="py-2 whitespace-nowrap text-gray-500">
              {new Date(ticket.created_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

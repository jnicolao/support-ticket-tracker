import { STATUSES, STATUS_LABELS, Stats, Status } from '@/lib/types';

const OPTIONS: { value: Status | null; label: string }[] = [
  { value: null, label: 'All' },
  ...STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
];

export default function StatusFilter({
  value,
  stats,
  onChange,
}: {
  value: Status | null;
  stats: Stats | null;
  onChange: (status: Status | null) => void;
}) {
  const total = stats ? STATUSES.reduce((sum, status) => sum + stats[status], 0) : 0;

  return (
    <div role="group" aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2 text-sm">
      {OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded border px-3 py-1 ${
            value === option.value ? 'border-gray-900 bg-gray-900 text-white' : ''
          }`}
        >
          {option.label}
          {stats && (
            <span className="ml-2 opacity-70">
              {option.value ? stats[option.value] : total}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

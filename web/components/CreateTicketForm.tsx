import { FormEvent, useState } from 'react';
import { ApiError, createTicket } from '@/lib/api';
import { PRIORITIES, Priority } from '@/lib/types';

function errorsFrom(err: unknown): Record<string, string> {
  if (err instanceof ApiError && err.details.length > 0) {
    return Object.fromEntries(err.details.map((detail) => [detail.path || 'form', detail.message]));
  }
  return { form: err instanceof Error ? err.message : 'Something went wrong' };
}

export default function CreateTicketForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await createTicket({ title, description, priority });
      setTitle('');
      setDescription('');
      setPriority('medium');
      onCreated();
    } catch (err) {
      setErrors(errorsFrom(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded border p-4">
      <h2 className="font-medium">New ticket</h2>

      {errors.form && (
        <p role="alert" className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">
          {errors.form}
        </p>
      )}

      <label className="mt-3 block text-sm">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className="mt-1 w-full rounded border px-2 py-1"
        />
      </label>
      {errors.title && (
        <p id="title-error" className="mt-1 text-sm text-red-700">
          {errors.title}
        </p>
      )}

      <label className="mt-3 block text-sm">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className="mt-1 w-full rounded border px-2 py-1"
        />
      </label>

      <div className="mt-3 flex items-end gap-3">
        <label className="block text-sm">
          Priority
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            aria-invalid={errors.priority ? true : undefined}
            aria-describedby={errors.priority ? 'priority-error' : undefined}
            className="select mt-1 block rounded border py-1 pr-8 pl-2 capitalize"
          >
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        {errors.priority && (
          <p id="priority-error" className="text-sm text-red-700">
            {errors.priority}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-gray-900 px-3 py-1 text-white disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create ticket'}
        </button>
      </div>
    </form>
  );
}

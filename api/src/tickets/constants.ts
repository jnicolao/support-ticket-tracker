export const STATUSES = ['open', 'in_progress', 'closed'] as const;
export const PRIORITIES = ['low', 'medium', 'high'] as const;

export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  created_at: Date;
  updated_at: Date;
}

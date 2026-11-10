import { Suspense } from 'react';
import TicketDetail from '@/components/TicketDetail';

export default function TicketPage() {
  return (
    <Suspense>
      <TicketDetail />
    </Suspense>
  );
}

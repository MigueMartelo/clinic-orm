import { formatCop, formatDateTime } from '@/lib/format';
import type { Tables } from '@/lib/supabase/database.types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type TimelineEvent = Tables<'patient_timeline'>;

const eventTypeLabels: Record<string, string> = {
  attendance: 'Atención',
  session: 'Sesión',
  package_started: 'Paquete',
  product_sale: 'Venta',
  clinical_note: 'Nota clínica',
  attachment: 'Adjunto',
};

type PatientTimelineProps = {
  events: TimelineEvent[];
};

export function PatientTimeline({ events }: PatientTimelineProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historia clínica</CardTitle>
          <CardDescription>
            Aún no hay eventos registrados para este paciente.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia clínica</CardTitle>
        <CardDescription>
          Línea de tiempo unificada de atenciones, sesiones y notas.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {events.map((event) => (
          <div
            key={`${event.source_table}-${event.source_id}`}
            className='flex flex-col gap-2 rounded-xl border p-4'
          >
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <Badge variant='secondary'>
                  {eventTypeLabels[event.event_type ?? ''] ?? event.event_type}
                </Badge>
                <span className='font-medium'>{event.title}</span>
              </div>
              <span className='text-sm text-muted-foreground'>
                {event.event_at ? formatDateTime(event.event_at) : '—'}
              </span>
            </div>
            {event.summary ? (
              <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                {event.summary}
              </p>
            ) : null}
            {event.total_cop != null ? (
              <div className='flex flex-wrap gap-4 text-sm'>
                <span>Total: {formatCop(event.total_cop)}</span>
                {event.balance_cop != null && event.balance_cop > 0 ? (
                  <span className='text-destructive'>
                    Saldo: {formatCop(event.balance_cop)}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

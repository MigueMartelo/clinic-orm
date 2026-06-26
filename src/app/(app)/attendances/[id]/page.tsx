import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AttendanceNotesForm } from '@/app/(app)/attendances/[id]/attendance-notes-form';
import { PaymentForm } from '@/app/(app)/attendances/[id]/payment-form';
import { requireProfile } from '@/lib/auth';
import { formatCop, formatDateTime } from '@/lib/format';
import { paymentMethodLabels } from '@/lib/payment-methods';
import { canWriteClinical, canWriteOperations } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AttendanceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AttendanceDetailPage({
  params,
}: AttendanceDetailPageProps) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from('attendances')
    .select(
      `
      *,
      patients!inner(id, full_name, phone),
      services!inner(name)
    `,
    )
    .eq('id', id)
    .single();

  if (error || !attendance) {
    notFound();
  }

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('attendance_id', id)
    .order('paid_at', { ascending: false });

  const patient = attendance.patients as {
    id: string;
    full_name: string;
    phone: string | null;
  };
  const service = attendance.services as { name: string };
  const canWrite = canWriteOperations(profile.role);
  const canClinical = canWriteClinical(profile.role);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4'>
        <Button
          variant='ghost'
          size='sm'
          className='w-fit px-0'
          render={<Link href='/attendances' />}
        >
          ← Volver a atenciones
        </Button>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {service.name}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {patient.full_name}
            {patient.phone ? ` · ${patient.phone}` : ''} ·{' '}
            {formatDateTime(attendance.attended_at)}
          </p>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Valores y saldo de la atención.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Total</span>
              <span className='font-medium'>
                {formatCop(attendance.total_cop)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Pagado</span>
              <span>{formatCop(attendance.paid_cop)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Saldo</span>
              {attendance.balance_cop > 0 ? (
                <Badge variant='destructive'>
                  {formatCop(attendance.balance_cop)}
                </Badge>
              ) : (
                <span>{formatCop(0)}</span>
              )}
            </div>
            <Button
              variant='outline'
              size='sm'
              className='w-fit'
              render={<Link href={`/patients/${patient.id}`} />}
            >
              Ver ficha del paciente
            </Button>
          </CardContent>
        </Card>

        <AttendanceNotesForm
          attendanceId={attendance.id}
          initialNotes={attendance.clinical_notes}
          readOnly={!canClinical}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagos</CardTitle>
          <CardDescription>
            Historial de abonos registrados para esta atención.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Forma de pago</TableHead>
                  <TableHead className='text-right'>Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className='text-muted-foreground'>
                      {formatDateTime(payment.paid_at)}
                    </TableCell>
                    <TableCell>
                      {paymentMethodLabels[payment.payment_method]}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCop(payment.amount_cop)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className='text-sm text-muted-foreground'>
              Aún no hay pagos registrados.
            </p>
          )}
        </CardContent>
      </Card>

      {canWrite ? (
        <PaymentForm
          attendanceId={attendance.id}
          maxAmount={attendance.balance_cop}
        />
      ) : null}
    </div>
  );
}

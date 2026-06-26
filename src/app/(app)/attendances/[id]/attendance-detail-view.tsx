'use client';

import Link from 'next/link';

import { AttendanceNotesForm } from '@/app/(app)/attendances/[id]/attendance-notes-form';
import { PaymentForm } from '@/app/(app)/attendances/[id]/payment-form';
import type { UserRole } from '@/lib/auth-types';
import { formatCop, formatDateTime } from '@/lib/format';
import { paymentMethodLabels } from '@/lib/payment-methods';
import { FetchNotFoundError } from '@/lib/query/fetchers';
import { canWriteClinical, canWriteOperations } from '@/lib/permissions';
import { useAttendanceDetail } from '@/hooks/queries/use-patients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AttendanceDetailViewProps = {
  attendanceId: string;
  role: UserRole;
};

function AttendanceDetailSkeleton() {
  return (
    <div className='flex flex-col gap-6'>
      <Skeleton className='h-8 w-64' />
      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-24 w-full' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-24 w-full' />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AttendanceDetailView({
  attendanceId,
  role,
}: AttendanceDetailViewProps) {
  const { data, isLoading, isError, error } = useAttendanceDetail(attendanceId);
  const canWrite = canWriteOperations(role);
  const canClinical = canWriteClinical(role);

  if (isLoading) {
    return <AttendanceDetailSkeleton />;
  }

  if (isError) {
    const isNotFound = error instanceof FetchNotFoundError;

    return (
      <div className='flex flex-col items-start gap-4'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          {isNotFound ? 'Atención no encontrada' : 'Error al cargar'}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {isNotFound
            ? 'La atención que buscas no existe o fue eliminada.'
            : error.message}
        </p>
        <Button render={<Link href='/attendances' />}>Volver al listado</Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { attendance, payments } = data;
  const patient = attendance.patients;
  const service = attendance.services;

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
          key={attendance.clinical_notes ?? 'empty'}
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
          {payments.length > 0 ? (
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

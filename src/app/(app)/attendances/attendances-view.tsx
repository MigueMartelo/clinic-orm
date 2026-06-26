'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import type { UserRole } from '@/lib/auth-types';
import { formatCop, formatDateTime, getTodayInBogota } from '@/lib/format';
import { getTotalPages, parsePaginationParams } from '@/lib/pagination';
import { canWriteOperations } from '@/lib/permissions';
import { useAttendancesList } from '@/hooks/queries/use-patients';
import { DateRangeFilter } from '@/app/(app)/attendances/date-range-filter';
import { PaginationControls } from '@/components/pagination-controls';
import { SearchInput } from '@/components/search-input';
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
type AttendancesViewProps = {
  role: UserRole;
};

function AttendancesViewContent({ role }: AttendancesViewProps) {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const { page, q, pageSize } = parsePaginationParams(params);
  const today = getTodayInBogota();
  const fromDate = searchParams.get('from') ?? today;
  const toDate = searchParams.get('to') ?? today;
  const canWrite = canWriteOperations(role);

  const { data, isLoading, isError, error } = useAttendancesList({
    page,
    q,
    fromDate,
    toDate,
    pageSize,
  });

  const attendances = data?.attendances ?? [];
  const count = data?.count ?? 0;
  const productionTotal = data?.productionTotal ?? 0;
  const totalPages = getTotalPages(count, pageSize);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Atenciones</h1>
          <p className='text-sm text-muted-foreground'>
            Producción del día y registro de atenciones.
          </p>
        </div>
        {canWrite ? (
          <Button render={<Link href='/attendances/new' />}>
            Registrar atención
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader className='gap-4'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <CardTitle>Producción del período</CardTitle>
              <CardDescription>
                {isLoading ? (
                  'Cargando...'
                ) : (
                  <>
                    {formatCop(productionTotal)} · {count} atención
                    {count === 1 ? '' : 'es'}
                  </>
                )}
              </CardDescription>
            </div>
            <DateRangeFilter from={fromDate} to={toDate} />
          </div>
          <SearchInput placeholder='Buscar por paciente' />
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          {isError ? (
            <p className='text-sm text-destructive'>{error.message}</p>
          ) : isLoading ? (
            <div className='flex flex-col gap-3'>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className='h-10 w-full' />
              ))}
            </div>
          ) : attendances.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead className='text-right'>Total</TableHead>
                    <TableHead className='text-right'>Saldo</TableHead>
                    <TableHead className='text-right'>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendances.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell className='text-muted-foreground'>
                        {formatDateTime(attendance.attended_at)}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {attendance.patients.full_name}
                      </TableCell>
                      <TableCell>{attendance.services.name}</TableCell>
                      <TableCell className='text-right'>
                        {formatCop(attendance.total_cop)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {attendance.balance_cop > 0 ? (
                          <Badge variant='destructive'>
                            {formatCop(attendance.balance_cop)}
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground'>
                            {formatCop(0)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='outline'
                          size='sm'
                          render={
                            <Link href={`/attendances/${attendance.id}`} />
                          }
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls page={page} totalPages={totalPages} />
            </>
          ) : (
            <p className='text-sm text-muted-foreground'>
              No hay atenciones en el período seleccionado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AttendancesView({ role }: AttendancesViewProps) {
  return (
    <Suspense fallback={<Skeleton className='h-64 w-full' />}>
      <AttendancesViewContent role={role} />
    </Suspense>
  );
}

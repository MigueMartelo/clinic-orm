'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import type { UserRole } from '@/lib/auth-types';
import { getTotalPages, parsePaginationParams } from '@/lib/pagination';
import { canWriteOperations } from '@/lib/permissions';
import { usePatientsList } from '@/hooks/queries/use-patients';
import { PaginationControls } from '@/components/pagination-controls';
import { SearchInput } from '@/components/search-input';
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

type PatientsViewProps = {
  role: UserRole;
};

function PatientsViewContent({ role }: PatientsViewProps) {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const { page, q, pageSize } = parsePaginationParams(params);
  const canWrite = canWriteOperations(role);

  const { data, isLoading, isError, error } = usePatientsList({
    page,
    q,
    pageSize,
  });

  const patients = data?.patients ?? [];
  const count = data?.count ?? 0;
  const totalPages = getTotalPages(count, pageSize);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Pacientes</h1>
          <p className='text-sm text-muted-foreground'>
            Ficha unificada e historial clínico de cada paciente.
          </p>
        </div>
        {canWrite ? (
          <Button render={<Link href='/patients/new' />}>Nuevo paciente</Button>
        ) : null}
      </div>

      <Card>
        <CardHeader className='gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <CardTitle>Listado</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Cargando...'
                : `${count} paciente${count === 1 ? '' : 's'}`}
            </CardDescription>
          </div>
          <SearchInput placeholder='Buscar por nombre o teléfono' />
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
          ) : patients.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead className='text-right'>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className='font-medium'>
                        {patient.full_name}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {patient.phone ?? '—'}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {patient.document_id ?? '—'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='outline'
                          size='sm'
                          render={<Link href={`/patients/${patient.id}`} />}
                        >
                          Ver ficha
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
              {q
                ? 'No se encontraron pacientes con esa búsqueda.'
                : 'Aún no hay pacientes registrados.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function PatientsView({ role }: PatientsViewProps) {
  return (
    <Suspense fallback={<Skeleton className='h-64 w-full' />}>
      <PatientsViewContent role={role} />
    </Suspense>
  );
}

'use client';

import Link from 'next/link';

import { ClinicalNoteForm } from '@/app/(app)/patients/[id]/clinical-note-form';
import { MedicalProfileForm } from '@/app/(app)/patients/[id]/medical-profile-form';
import { PatientTimeline } from '@/app/(app)/patients/[id]/patient-timeline';
import { PatientForm } from '@/app/(app)/patients/patient-form';
import type { UserRole } from '@/lib/auth-types';
import { formatCop } from '@/lib/format';
import { FetchNotFoundError } from '@/lib/query/fetchers';
import { canWriteClinical, canWriteOperations } from '@/lib/permissions';
import { usePatientDetail } from '@/hooks/queries/use-patients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PatientDetailViewProps = {
  patientId: string;
  role: UserRole;
};

function PatientDetailSkeleton() {
  return (
    <div className='flex flex-col gap-6'>
      <Skeleton className='h-8 w-64' />
      <Skeleton className='h-4 w-96' />
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-40' />
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className='h-10 w-full' />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function PatientDetailView({ patientId, role }: PatientDetailViewProps) {
  const { data, isLoading, isError, error } = usePatientDetail(patientId);
  const canWrite = canWriteOperations(role);
  const canClinical = canWriteClinical(role);

  if (isLoading) {
    return <PatientDetailSkeleton />;
  }

  if (isError) {
    const isNotFound = error instanceof FetchNotFoundError;

    return (
      <div className='flex flex-col items-start gap-4'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          {isNotFound ? 'Paciente no encontrado' : 'Error al cargar'}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {isNotFound
            ? 'El paciente que buscas no existe o fue eliminado.'
            : error.message}
        </p>
        <Button render={<Link href='/patients' />}>Volver al listado</Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { patient, timeline, medicalProfile, totalBalance } = data;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-col gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='w-fit px-0'
            render={<Link href='/patients' />}
          >
            ← Volver a pacientes
          </Button>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {patient.full_name}
          </h1>
          <div className='flex flex-wrap gap-2 text-sm text-muted-foreground'>
            {patient.phone ? <span>{patient.phone}</span> : null}
            {patient.document_id ? <span>· {patient.document_id}</span> : null}
            {patient.email ? <span>· {patient.email}</span> : null}
          </div>
          {totalBalance > 0 ? (
            <Badge variant='destructive' className='w-fit'>
              Saldo pendiente: {formatCop(totalBalance)}
            </Badge>
          ) : (
            <Badge variant='secondary' className='w-fit'>
              Sin saldo pendiente
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue='summary'>
        <TabsList>
          <TabsTrigger value='summary'>Resumen</TabsTrigger>
          <TabsTrigger value='timeline'>Historia clínica</TabsTrigger>
          <TabsTrigger value='medical'>Perfil médico</TabsTrigger>
        </TabsList>

        <TabsContent value='summary' className='mt-4'>
          {canWrite ? (
            <PatientForm
              patient={patient}
              title='Datos del paciente'
              description='Actualiza la información de contacto del paciente.'
              submitLabel='Guardar cambios'
            />
          ) : (
            <PatientForm
              patient={patient}
              readOnly
              title='Datos del paciente'
              description='Información de contacto (solo lectura).'
            />
          )}
        </TabsContent>

        <TabsContent value='timeline' className='mt-4 flex flex-col gap-6'>
          <PatientTimeline events={timeline} />
          {canClinical ? <ClinicalNoteForm patientId={patient.id} /> : null}
        </TabsContent>

        <TabsContent value='medical' className='mt-4'>
          <MedicalProfileForm
            key={medicalProfile?.updated_at ?? 'empty'}
            patientId={patient.id}
            profile={medicalProfile}
            readOnly={!canClinical}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

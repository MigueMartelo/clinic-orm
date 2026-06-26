import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClinicalNoteForm } from '@/app/(app)/patients/[id]/clinical-note-form';
import { MedicalProfileForm } from '@/app/(app)/patients/[id]/medical-profile-form';
import { PatientTimeline } from '@/app/(app)/patients/[id]/patient-timeline';
import { PatientForm } from '@/app/(app)/patients/patient-form';
import { requireProfile } from '@/lib/auth';
import { formatCop } from '@/lib/format';
import { canWriteClinical, canWriteOperations } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PatientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !patient) {
    notFound();
  }

  const [{ data: timeline }, { data: medicalProfile }, { data: receivables }] =
    await Promise.all([
      supabase
        .from('patient_timeline')
        .select('*')
        .eq('patient_id', id)
        .order('event_at', { ascending: false }),
      supabase
        .from('patient_medical_profiles')
        .select('*')
        .eq('patient_id', id)
        .maybeSingle(),
      supabase.from('receivables').select('balance_cop').eq('patient_id', id),
    ]);

  const totalBalance =
    receivables?.reduce((sum, row) => sum + (row.balance_cop ?? 0), 0) ?? 0;
  const canWrite = canWriteOperations(profile.role);
  const canClinical = canWriteClinical(profile.role);

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
          <PatientTimeline events={timeline ?? []} />
          {canClinical ? <ClinicalNoteForm patientId={patient.id} /> : null}
        </TabsContent>

        <TabsContent value='medical' className='mt-4'>
          <MedicalProfileForm
            patientId={patient.id}
            profile={medicalProfile}
            readOnly={!canClinical}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

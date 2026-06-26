import { PatientForm } from '@/app/(app)/patients/patient-form';
import { requireProfile } from '@/lib/auth';
import { canWriteOperations } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function NewPatientPage() {
  const profile = await requireProfile();

  if (!canWriteOperations(profile.role)) {
    redirect('/patients');
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Nuevo paciente
          </h1>
          <p className='text-sm text-muted-foreground'>
            Registra un paciente en el sistema.
          </p>
        </div>
        <Button variant='outline' render={<Link href='/patients' />}>
          Volver
        </Button>
      </div>

      <PatientForm />
    </div>
  );
}

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function PatientNotFound() {
  return (
    <div className='flex flex-col items-start gap-4'>
      <h1 className='text-2xl font-semibold tracking-tight'>
        Paciente no encontrado
      </h1>
      <p className='text-sm text-muted-foreground'>
        El paciente que buscas no existe o fue eliminado.
      </p>
      <Button render={<Link href='/patients' />}>Volver al listado</Button>
    </div>
  );
}

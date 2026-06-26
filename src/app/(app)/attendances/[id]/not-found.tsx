import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function AttendanceNotFound() {
  return (
    <div className='flex flex-col items-start gap-4'>
      <h1 className='text-2xl font-semibold tracking-tight'>
        Atención no encontrada
      </h1>
      <p className='text-sm text-muted-foreground'>
        La atención que buscas no existe o fue eliminada.
      </p>
      <Button render={<Link href='/attendances' />}>Volver al listado</Button>
    </div>
  );
}

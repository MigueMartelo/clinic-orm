import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AttendanceForm } from '@/app/(app)/attendances/attendance-form';
import { requireProfile } from '@/lib/auth';
import { canWriteOperations } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function NewAttendancePage() {
  const profile = await requireProfile();

  if (!canWriteOperations(profile.role)) {
    redirect('/attendances');
  }

  const supabase = await createClient();
  const [{ data: patients }, { data: services }] = await Promise.all([
    supabase.from('patients').select('id, full_name, phone').order('full_name'),
    supabase
      .from('services')
      .select('id, name, default_price_cop')
      .eq('active', true)
      .eq('session_mode', 'none')
      .order('name'),
  ]);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Registrar atención
          </h1>
          <p className='text-sm text-muted-foreground'>
            Registra una atención de servicio único con pago opcional.
          </p>
        </div>
        <Button variant='outline' render={<Link href='/attendances' />}>
          Volver
        </Button>
      </div>

      <AttendanceForm patients={patients ?? []} services={services ?? []} />
    </div>
  );
}

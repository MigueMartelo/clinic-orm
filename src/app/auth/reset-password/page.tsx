import { redirect } from 'next/navigation';

import { ResetPasswordForm } from '@/app/auth/reset-password/reset-password-form';
import { getSessionUser } from '@/lib/auth';

export default async function ResetPasswordPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login/recuperar');
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-6'>
      <div className='mb-8 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>Clinic ORM</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Restablecer contraseña
        </p>
      </div>
      <ResetPasswordForm />
    </main>
  );
}

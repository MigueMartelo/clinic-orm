import { ForgotPasswordForm } from '@/app/(auth)/login/forgot-password/forgot-password-form';

export default function RecuperarPasswordPage() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-6'>
      <div className='mb-8 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>Clinic ORM</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Consultorio de medicina estética
        </p>
      </div>
      <ForgotPasswordForm />
    </main>
  );
}

'use client';

import Link from 'next/link';
import { startTransition, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  requestPasswordResetAction,
  type RequestResetState,
} from '@/app/(auth)/login/forgot-password/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const initialState: RequestResetState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set('email', values.email);
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>
          Te enviaremos un enlace a tu correo para crear una nueva contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='flex flex-col gap-4' onSubmit={onSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='email'>Correo</Label>
            <Input
              id='email'
              type='email'
              autoComplete='email'
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email ? (
              <p className='text-sm text-destructive'>{errors.email.message}</p>
            ) : null}
          </div>

          {state.error ? (
            <p className='text-sm text-destructive'>{state.error}</p>
          ) : null}

          {state.success ? (
            <p className='text-sm text-muted-foreground'>{state.success}</p>
          ) : null}

          <Button type='submit' disabled={isPending} className='w-full'>
            {isPending ? 'Enviando...' : 'Enviar enlace'}
          </Button>

          <Link
            href='/login'
            className='text-center text-sm text-muted-foreground hover:text-foreground'
          >
            Volver al inicio de sesión
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}

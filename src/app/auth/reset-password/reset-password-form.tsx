'use client';

import Link from 'next/link';
import { startTransition, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  updatePasswordAction,
  type UpdatePasswordState,
} from '@/app/auth/reset-password/actions';
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

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const initialState: UpdatePasswordState = {};

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set('password', values.password);
    formData.set('confirmPassword', values.confirmPassword);
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>Nueva contraseña</CardTitle>
        <CardDescription>
          Elige una contraseña segura para tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='flex flex-col gap-4' onSubmit={onSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='password'>Contraseña</Label>
            <Input
              id='password'
              type='password'
              autoComplete='new-password'
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password ? (
              <p className='text-sm text-destructive'>
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='confirmPassword'>Confirmar contraseña</Label>
            <Input
              id='confirmPassword'
              type='password'
              autoComplete='new-password'
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <p className='text-sm text-destructive'>
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {state.error ? (
            <p className='text-sm text-destructive'>{state.error}</p>
          ) : null}

          <Button type='submit' disabled={isPending} className='w-full'>
            {isPending ? 'Guardando...' : 'Guardar contraseña'}
          </Button>

          <Link
            href='/login/forgot-password'
            className='text-center text-sm text-muted-foreground hover:text-foreground'
          >
            Solicitar un nuevo enlace
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}

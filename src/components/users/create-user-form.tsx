'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { createUserAction, type ActionState } from '@/app/(app)/users/actions';
import { roleLabels, userRoles } from '@/lib/auth-types';
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

const createUserFormSchema = z.object({
  full_name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['admin', 'recepcion', 'doctora']),
});

type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

const initialState: ActionState = {};
const roles = userRoles;

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(
    createUserAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      role: 'recepcion',
    },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      reset();
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [reset, state.error, state.success]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set('full_name', values.full_name);
    formData.set('email', values.email);
    formData.set('password', values.password);
    formData.set('role', values.role);
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear usuario</CardTitle>
        <CardDescription>
          Crea una cuenta con correo y contraseña, y asigna su rol.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='grid gap-4 md:grid-cols-2' onSubmit={onSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='full_name'>Nombre completo</Label>
            <Input
              id='full_name'
              autoComplete='name'
              aria-invalid={Boolean(errors.full_name)}
              {...register('full_name')}
            />
            {errors.full_name ? (
              <p className='text-sm text-destructive'>
                {errors.full_name.message}
              </p>
            ) : null}
          </div>

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
            <Label htmlFor='role'>Rol</Label>
            <select
              id='role'
              className='flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'
              {...register('role')}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
            {errors.role ? (
              <p className='text-sm text-destructive'>{errors.role.message}</p>
            ) : null}
          </div>

          <div className='md:col-span-2'>
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

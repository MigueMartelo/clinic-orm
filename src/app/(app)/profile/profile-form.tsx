'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  updateProfileAction,
  type UpdateProfileState,
} from '@/app/(app)/profile/actions';
import { roleLabels, type Profile } from '@/lib/auth-types';
import { Badge } from '@/components/ui/badge';
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

const profileFormSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type ProfileFormProps = {
  profile: Profile;
  email: string;
};

const initialState: UpdateProfileState = {};

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile.full_name,
    },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error, state.success]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set('full_name', values.full_name);
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Card className='max-w-lg'>
      <CardHeader>
        <CardTitle>Datos personales</CardTitle>
        <CardDescription>
          Actualiza tu nombre. El correo y el rol solo los puede cambiar un
          administrador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='flex flex-col gap-4' onSubmit={onSubmit}>
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
            <Input id='email' value={email} disabled readOnly />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Rol</Label>
            <div>
              <Badge variant='secondary'>{roleLabels[profile.role]}</Badge>
            </div>
          </div>

          <Button type='submit' disabled={isPending} className='w-fit'>
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

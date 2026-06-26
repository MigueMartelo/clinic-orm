'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  createPatientAction,
  updatePatientAction,
  type PatientActionState,
} from '@/app/(app)/patients/actions';
import { useInvalidatePatients } from '@/hooks/queries/use-invalidate';
import type { Tables } from '@/lib/supabase/database.types';
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
import { Textarea } from '@/components/ui/textarea';

const patientFormSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  document_id: z.string().optional(),
  email: z
    .string()
    .email('Ingresa un correo válido')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

type PatientFormProps = {
  patient?: Tables<'patients'>;
  onSuccess?: (patientId: string) => void;
  submitLabel?: string;
  title?: string;
  description?: string;
  readOnly?: boolean;
};

const initialState: PatientActionState = {};

export function PatientForm({
  patient,
  onSuccess,
  submitLabel,
  title = 'Datos del paciente',
  description = 'Información de contacto y notas administrativas.',
  readOnly = false,
}: PatientFormProps) {
  const router = useRouter();
  const invalidatePatients = useInvalidatePatients();
  const action = patient ? updatePatientAction : createPatientAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      full_name: patient?.full_name ?? '',
      phone: patient?.phone ?? '',
      document_id: patient?.document_id ?? '',
      email: patient?.email ?? '',
      notes: patient?.notes ?? '',
    },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      invalidatePatients();
      if (state.patientId) {
        if (onSuccess) {
          onSuccess(state.patientId);
        } else if (!patient) {
          router.push(`/patients/${state.patientId}`);
        }
      }
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [
    invalidatePatients,
    onSuccess,
    patient,
    router,
    state.error,
    state.patientId,
    state.success,
  ]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    if (patient) {
      formData.set('patient_id', patient.id);
    }
    formData.set('full_name', values.full_name);
    formData.set('phone', values.phone ?? '');
    formData.set('document_id', values.document_id ?? '');
    formData.set('email', values.email ?? '');
    formData.set('notes', values.notes ?? '');
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className='flex flex-col gap-4' onSubmit={onSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='full_name'>Nombre completo</Label>
            <Input
              id='full_name'
              autoComplete='name'
              readOnly={readOnly}
              aria-invalid={Boolean(errors.full_name)}
              {...register('full_name')}
            />
            {errors.full_name ? (
              <p className='text-sm text-destructive'>
                {errors.full_name.message}
              </p>
            ) : null}
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='phone'>Teléfono</Label>
              <Input
                id='phone'
                autoComplete='tel'
                readOnly={readOnly}
                {...register('phone')}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='document_id'>Documento</Label>
              <Input
                id='document_id'
                readOnly={readOnly}
                {...register('document_id')}
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='email'>Correo</Label>
            <Input
              id='email'
              type='email'
              autoComplete='email'
              readOnly={readOnly}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email ? (
              <p className='text-sm text-destructive'>{errors.email.message}</p>
            ) : null}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='notes'>Notas</Label>
            <Textarea
              id='notes'
              rows={3}
              readOnly={readOnly}
              {...register('notes')}
            />
          </div>

          {!readOnly ? (
            <Button type='submit' disabled={isPending} className='w-fit'>
              {isPending
                ? 'Guardando...'
                : (submitLabel ??
                  (patient ? 'Guardar cambios' : 'Crear paciente'))}
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

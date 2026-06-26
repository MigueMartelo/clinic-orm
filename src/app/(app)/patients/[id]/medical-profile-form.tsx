'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  upsertMedicalProfileAction,
  type PatientDetailActionState,
} from '@/app/(app)/patients/[id]/actions';
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

const medicalProfileSchema = z.object({
  allergies: z.string().optional(),
  medications: z.string().optional(),
  contraindications: z.string().optional(),
  skin_type: z.string().optional(),
  consent_notes: z.string().optional(),
});

type MedicalProfileFormValues = z.infer<typeof medicalProfileSchema>;

type MedicalProfileFormProps = {
  patientId: string;
  profile: Tables<'patient_medical_profiles'> | null;
  readOnly?: boolean;
};

const initialState: PatientDetailActionState = {};

export function MedicalProfileForm({
  patientId,
  profile,
  readOnly = false,
}: MedicalProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    upsertMedicalProfileAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicalProfileFormValues>({
    resolver: zodResolver(medicalProfileSchema),
    defaultValues: {
      allergies: profile?.allergies ?? '',
      medications: profile?.medications ?? '',
      contraindications: profile?.contraindications ?? '',
      skin_type: profile?.skin_type ?? '',
      consent_notes: profile?.consent_notes ?? '',
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
    formData.set('patient_id', patientId);
    formData.set('allergies', values.allergies ?? '');
    formData.set('medications', values.medications ?? '');
    formData.set('contraindications', values.contraindications ?? '');
    formData.set('skin_type', values.skin_type ?? '');
    formData.set('consent_notes', values.consent_notes ?? '');
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil médico</CardTitle>
        <CardDescription>
          Antecedentes, alergias y consentimiento informado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='flex flex-col gap-4' onSubmit={onSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='allergies'>Alergias</Label>
            <Textarea
              id='allergies'
              rows={2}
              readOnly={readOnly}
              {...register('allergies')}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='medications'>Medicamentos</Label>
            <Textarea
              id='medications'
              rows={2}
              readOnly={readOnly}
              {...register('medications')}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='contraindications'>Contraindicaciones</Label>
            <Textarea
              id='contraindications'
              rows={2}
              readOnly={readOnly}
              {...register('contraindications')}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='skin_type'>Tipo de piel</Label>
            <Input
              id='skin_type'
              readOnly={readOnly}
              {...register('skin_type')}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='consent_notes'>Notas de consentimiento</Label>
            <Textarea
              id='consent_notes'
              rows={2}
              readOnly={readOnly}
              {...register('consent_notes')}
            />
          </div>
          {!readOnly ? (
            <Button type='submit' disabled={isPending} className='w-fit'>
              {isPending ? 'Guardando...' : 'Guardar perfil médico'}
            </Button>
          ) : null}
          {errors.allergies ? (
            <p className='text-sm text-destructive'>
              {errors.allergies.message}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

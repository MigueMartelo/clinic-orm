'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  addClinicalNoteAction,
  type PatientDetailActionState,
} from '@/app/(app)/patients/[id]/actions';
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

const clinicalNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'La nota no puede estar vacía'),
});

type ClinicalNoteFormValues = z.infer<typeof clinicalNoteSchema>;

type ClinicalNoteFormProps = {
  patientId: string;
};

const initialState: PatientDetailActionState = {};

export function ClinicalNoteForm({ patientId }: ClinicalNoteFormProps) {
  const [state, formAction, isPending] = useActionState(
    addClinicalNoteAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClinicalNoteFormValues>({
    resolver: zodResolver(clinicalNoteSchema),
    defaultValues: { title: '', content: '' },
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
    formData.set('patient_id', patientId);
    formData.set('title', values.title ?? '');
    formData.set('content', values.content);
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva nota clínica</CardTitle>
        <CardDescription>
          Registra observaciones clínicas del paciente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='flex flex-col gap-4' onSubmit={onSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='title'>Título (opcional)</Label>
            <Input id='title' {...register('title')} />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='content'>Nota</Label>
            <Textarea
              id='content'
              rows={4}
              aria-invalid={Boolean(errors.content)}
              {...register('content')}
            />
            {errors.content ? (
              <p className='text-sm text-destructive'>
                {errors.content.message}
              </p>
            ) : null}
          </div>
          <Button type='submit' disabled={isPending} className='w-fit'>
            {isPending ? 'Guardando...' : 'Agregar nota'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

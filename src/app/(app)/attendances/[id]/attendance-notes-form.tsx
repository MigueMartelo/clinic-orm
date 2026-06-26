'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  updateAttendanceNotesAction,
  type AttendanceActionState,
} from '@/app/(app)/attendances/actions';
import { useInvalidateAttendanceDetail } from '@/hooks/queries/use-invalidate';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const notesSchema = z.object({
  clinical_notes: z.string().optional(),
});

type NotesFormValues = z.infer<typeof notesSchema>;

type AttendanceNotesFormProps = {
  attendanceId: string;
  initialNotes: string | null;
  readOnly?: boolean;
};

const initialState: AttendanceActionState = {};

export function AttendanceNotesForm({
  attendanceId,
  initialNotes,
  readOnly = false,
}: AttendanceNotesFormProps) {
  const invalidateAttendanceDetail =
    useInvalidateAttendanceDetail(attendanceId);
  const [state, formAction, isPending] = useActionState(
    updateAttendanceNotesAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: { clinical_notes: initialNotes ?? '' },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      invalidateAttendanceDetail();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [invalidateAttendanceDetail, state.error, state.success]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set('attendance_id', attendanceId);
    formData.set('clinical_notes', values.clinical_notes ?? '');
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas clínicas</CardTitle>
        <CardDescription>
          Observaciones del procedimiento para esta atención.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='flex flex-col gap-4' onSubmit={onSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='clinical_notes'>Notas</Label>
            <Textarea
              id='clinical_notes'
              rows={4}
              readOnly={readOnly}
              {...register('clinical_notes')}
            />
            {errors.clinical_notes ? (
              <p className='text-sm text-destructive'>
                {errors.clinical_notes.message}
              </p>
            ) : null}
          </div>
          {!readOnly ? (
            <Button type='submit' disabled={isPending} className='w-fit'>
              {isPending ? 'Guardando...' : 'Guardar notas'}
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

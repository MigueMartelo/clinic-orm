'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  addPaymentAction,
  type AttendanceActionState,
} from '@/app/(app)/attendances/actions';
import {
  useInvalidateAttendances,
  useInvalidateAttendanceDetail,
  useInvalidatePatients,
} from '@/hooks/queries/use-invalidate';
import { formatCop, parseCopInput } from '@/lib/format';
import { paymentMethodLabels, paymentMethods } from '@/lib/payment-methods';
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

const paymentFormSchema = z.object({
  payment_method: z.string().min(1, 'Selecciona la forma de pago'),
  amount_cop: z.string().min(1, 'Ingresa el monto'),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

type PaymentFormProps = {
  attendanceId: string;
  maxAmount: number;
};

const selectClassName =
  'flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30';

const initialState: AttendanceActionState = {};

export function PaymentForm({ attendanceId, maxAmount }: PaymentFormProps) {
  const invalidateAttendances = useInvalidateAttendances();
  const invalidateAttendanceDetail =
    useInvalidateAttendanceDetail(attendanceId);
  const invalidatePatients = useInvalidatePatients();
  const [state, formAction, isPending] = useActionState(
    addPaymentAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { payment_method: '', amount_cop: '' },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      invalidateAttendances();
      invalidateAttendanceDetail();
      invalidatePatients();
      reset();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [
    invalidateAttendanceDetail,
    invalidateAttendances,
    invalidatePatients,
    reset,
    state.error,
    state.success,
  ]);

  const onSubmit = handleSubmit((values) => {
    const amount = parseCopInput(values.amount_cop);
    if (amount > maxAmount) {
      toast.error('El pago supera el saldo pendiente');
      return;
    }
    const formData = new FormData();
    formData.set('attendance_id', attendanceId);
    formData.set('payment_method', values.payment_method);
    formData.set('amount_cop', String(amount));
    startTransition(() => {
      formAction(formData);
    });
  });

  if (maxAmount <= 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar pago</CardTitle>
        <CardDescription>
          Saldo pendiente: {formatCop(maxAmount)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='flex flex-col gap-4' onSubmit={onSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='payment_method'>Forma de pago</Label>
            <select
              id='payment_method'
              className={selectClassName}
              {...register('payment_method')}
            >
              <option value=''>Seleccionar</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {paymentMethodLabels[method]}
                </option>
              ))}
            </select>
            {errors.payment_method ? (
              <p className='text-sm text-destructive'>
                {errors.payment_method.message}
              </p>
            ) : null}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='amount_cop'>Monto (COP)</Label>
            <Input
              id='amount_cop'
              inputMode='numeric'
              aria-invalid={Boolean(errors.amount_cop)}
              {...register('amount_cop')}
            />
            {errors.amount_cop ? (
              <p className='text-sm text-destructive'>
                {errors.amount_cop.message}
              </p>
            ) : null}
          </div>
          <Button type='submit' disabled={isPending} className='w-fit'>
            {isPending ? 'Guardando...' : 'Registrar pago'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

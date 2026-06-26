'use client';

import { useRouter } from 'next/navigation';
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  createAttendanceAction,
  type AttendanceActionState,
} from '@/app/(app)/attendances/actions';
import { useInvalidateAttendances } from '@/hooks/queries/use-invalidate';
import {
  bogotaDateTimeToIso,
  formatCop,
  getTodayInBogota,
  parseCopInput,
} from '@/lib/format';
import { paymentMethodLabels, paymentMethods } from '@/lib/payment-methods';
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

type PatientOption = Pick<Tables<'patients'>, 'id' | 'full_name' | 'phone'>;
type ServiceOption = Pick<
  Tables<'services'>,
  'id' | 'name' | 'default_price_cop'
>;

const attendanceFormSchema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  service_id: z.string().min(1, 'Selecciona un servicio'),
  total_cop: z.string().min(1, 'Ingresa el valor total'),
  payment_amount: z.string().optional(),
  payment_method: z.string().optional(),
  clinical_notes: z.string().optional(),
  attended_date: z.string().min(1, 'La fecha es obligatoria'),
  attended_time: z.string().min(1, 'La hora es obligatoria'),
});

type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

type AttendanceFormProps = {
  patients: PatientOption[];
  services: ServiceOption[];
};

const selectClassName =
  'flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30';

const initialState: AttendanceActionState = {};

export function AttendanceForm({ patients, services }: AttendanceFormProps) {
  const router = useRouter();
  const invalidateAttendances = useInvalidateAttendances();
  const today = getTodayInBogota();
  const [state, formAction, isPending] = useActionState(
    createAttendanceAction,
    initialState,
  );
  const [totalDisplay, setTotalDisplay] = useState('');
  const [paymentDisplay, setPaymentDisplay] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      patient_id: '',
      service_id: '',
      total_cop: '',
      payment_amount: '',
      payment_method: '',
      clinical_notes: '',
      attended_date: today,
      attended_time: '12:00',
    },
  });

  const watched = watch();
  const totalCop = parseCopInput(watched.total_cop ?? totalDisplay);
  const paymentCop = parseCopInput(watched.payment_amount ?? paymentDisplay);
  const balanceCop = Math.max(totalCop - paymentCop, 0);

  const selectedService = useMemo(
    () => services.find((service) => service.id === watched.service_id),
    [services, watched.service_id],
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      invalidateAttendances();
      if (state.attendanceId) {
        router.push(`/attendances/${state.attendanceId}`);
      }
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [
    invalidateAttendances,
    router,
    state.attendanceId,
    state.error,
    state.success,
  ]);

  const onServiceChange = (serviceId: string) => {
    setValue('service_id', serviceId, { shouldValidate: true });
    const service = services.find((item) => item.id === serviceId);
    if (service && service.default_price_cop > 0) {
      const formatted = String(service.default_price_cop);
      setTotalDisplay(formatCop(service.default_price_cop));
      setValue('total_cop', formatted, { shouldValidate: true });
    }
  };

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set('patient_id', values.patient_id);
    formData.set('service_id', values.service_id);
    formData.set('total_cop', String(parseCopInput(values.total_cop)));
    formData.set(
      'attended_at',
      bogotaDateTimeToIso(values.attended_date, values.attended_time),
    );
    formData.set('clinical_notes', values.clinical_notes ?? '');
    const paymentAmount = parseCopInput(values.payment_amount ?? '');
    formData.set('payment_amount', String(paymentAmount));
    if (paymentAmount > 0 && values.payment_method) {
      formData.set('payment_method', values.payment_method);
    }
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar atención</CardTitle>
        <CardDescription>
          Producción del día para servicios de una sola visita.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='flex flex-col gap-4' onSubmit={onSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='patient_id'>Paciente</Label>
            <select
              id='patient_id'
              className={selectClassName}
              {...register('patient_id')}
            >
              <option value=''>Seleccionar paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                  {patient.phone ? ` · ${patient.phone}` : ''}
                </option>
              ))}
            </select>
            {errors.patient_id ? (
              <p className='text-sm text-destructive'>
                {errors.patient_id.message}
              </p>
            ) : null}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='service_id'>Servicio</Label>
            <select
              id='service_id'
              className={selectClassName}
              {...register('service_id', {
                onChange: (event) => onServiceChange(event.target.value),
              })}
            >
              <option value=''>Seleccionar servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                  {service.default_price_cop > 0
                    ? ` · ${formatCop(service.default_price_cop)}`
                    : ''}
                </option>
              ))}
            </select>
            {errors.service_id ? (
              <p className='text-sm text-destructive'>
                {errors.service_id.message}
              </p>
            ) : null}
            {selectedService ? (
              <p className='text-xs text-muted-foreground'>
                Precio sugerido:{' '}
                {selectedService.default_price_cop > 0
                  ? formatCop(selectedService.default_price_cop)
                  : 'Sin precio base'}
              </p>
            ) : null}
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='attended_date'>Fecha</Label>
              <Input
                id='attended_date'
                type='date'
                {...register('attended_date')}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='attended_time'>Hora</Label>
              <Input
                id='attended_time'
                type='time'
                {...register('attended_time')}
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='total_cop'>Valor total (COP)</Label>
            <Input
              id='total_cop'
              inputMode='numeric'
              value={totalDisplay}
              onChange={(event) => {
                setTotalDisplay(event.target.value);
                setValue('total_cop', event.target.value, {
                  shouldValidate: true,
                });
              }}
              aria-invalid={Boolean(errors.total_cop)}
            />
            {errors.total_cop ? (
              <p className='text-sm text-destructive'>
                {errors.total_cop.message}
              </p>
            ) : null}
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='payment_amount'>Abono (opcional)</Label>
              <Input
                id='payment_amount'
                inputMode='numeric'
                value={paymentDisplay}
                onChange={(event) => {
                  setPaymentDisplay(event.target.value);
                  setValue('payment_amount', event.target.value);
                }}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='payment_method'>Forma de pago</Label>
              <select
                id='payment_method'
                className={selectClassName}
                {...register('payment_method')}
              >
                <option value=''>Si hay abono</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {paymentMethodLabels[method]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className='text-sm text-muted-foreground'>
            Saldo pendiente:{' '}
            <span
              className={
                balanceCop > 0 ? 'font-medium text-destructive' : 'font-medium'
              }
            >
              {formatCop(balanceCop)}
            </span>
          </p>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='clinical_notes'>Notas clínicas (opcional)</Label>
            <Textarea
              id='clinical_notes'
              rows={3}
              {...register('clinical_notes')}
            />
          </div>

          <Button type='submit' disabled={isPending} className='w-fit'>
            {isPending ? 'Guardando...' : 'Registrar atención'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

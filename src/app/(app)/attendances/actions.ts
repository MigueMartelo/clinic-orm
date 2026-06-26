'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { writeAuditLog } from '@/lib/audit';
import { requireProfile } from '@/lib/auth';
import { canWriteClinical, canWriteOperations } from '@/lib/permissions';
import { paymentMethods } from '@/lib/payment-methods';
import { createClient } from '@/lib/supabase/server';

const paymentMethodSchema = z.enum(paymentMethods);

const attendanceBaseSchema = z.object({
  patient_id: z.string().uuid('Selecciona un paciente'),
  service_id: z.string().uuid('Selecciona un servicio'),
  total_cop: z.coerce
    .number()
    .int('El valor debe ser un número entero')
    .positive('El valor debe ser mayor a cero'),
  clinical_notes: z.string().optional(),
  attended_at: z.string().min(1, 'La fecha es obligatoria'),
  payment_method: paymentMethodSchema.optional(),
  payment_amount: z.coerce.number().int().min(0).optional(),
});

export type AttendanceActionState = {
  error?: string;
  success?: string;
  attendanceId?: string;
};

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function syncAttendanceBalances(
  attendanceId: string,
  totalCop: number,
): Promise<{ error?: string; paidCop: number; balanceCop: number }> {
  const supabase = await createClient();
  const { data: payments, error } = await supabase
    .from('payments')
    .select('amount_cop')
    .eq('attendance_id', attendanceId);

  if (error) {
    return { error: error.message, paidCop: 0, balanceCop: totalCop };
  }

  const paidCop =
    payments?.reduce((sum, payment) => sum + payment.amount_cop, 0) ?? 0;
  const balanceCop = totalCop - paidCop;

  if (balanceCop < 0) {
    return { error: 'Los pagos superan el total de la atención', paidCop, balanceCop };
  }

  const { error: updateError } = await supabase
    .from('attendances')
    .update({ paid_cop: paidCop, balance_cop: balanceCop })
    .eq('id', attendanceId);

  if (updateError) {
    return { error: updateError.message, paidCop, balanceCop };
  }

  return { paidCop, balanceCop };
}

export async function createAttendanceAction(
  _prevState: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const profile = await requireProfile();

  if (!canWriteOperations(profile.role)) {
    return { error: 'No autorizado' };
  }

  const parsed = attendanceBaseSchema.safeParse({
    patient_id: formData.get('patient_id'),
    service_id: formData.get('service_id'),
    total_cop: formData.get('total_cop'),
    clinical_notes: formData.get('clinical_notes') || undefined,
    attended_at: formData.get('attended_at'),
    payment_method: formData.get('payment_method') || undefined,
    payment_amount: formData.get('payment_amount') || 0,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  const paymentAmount = parsed.data.payment_amount ?? 0;
  if (paymentAmount > 0 && !parsed.data.payment_method) {
    return { error: 'Selecciona la forma de pago' };
  }
  if (paymentAmount > parsed.data.total_cop) {
    return { error: 'El pago no puede superar el total' };
  }

  const paidCop = paymentAmount;
  const balanceCop = parsed.data.total_cop - paidCop;
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from('attendances')
    .insert({
      patient_id: parsed.data.patient_id,
      service_id: parsed.data.service_id,
      total_cop: parsed.data.total_cop,
      paid_cop: paidCop,
      balance_cop: balanceCop,
      clinical_notes: emptyToNull(parsed.data.clinical_notes),
      attended_at: parsed.data.attended_at,
      recorded_by: profile.id,
    })
    .select('id')
    .single();

  if (error || !attendance) {
    return { error: error?.message ?? 'No se pudo registrar la atención' };
  }

  if (paymentAmount > 0 && parsed.data.payment_method) {
    const { error: paymentError } = await supabase.from('payments').insert({
      attendance_id: attendance.id,
      payment_method: parsed.data.payment_method,
      amount_cop: paymentAmount,
      recorded_by: profile.id,
    });

    if (paymentError) {
      await supabase.from('attendances').delete().eq('id', attendance.id);
      return { error: paymentError.message };
    }
  }

  await writeAuditLog({
    action: 'create',
    tableName: 'attendances',
    recordId: attendance.id,
    newData: {
      patient_id: parsed.data.patient_id,
      service_id: parsed.data.service_id,
      total_cop: parsed.data.total_cop,
      paid_cop: paidCop,
      balance_cop: balanceCop,
    },
  });

  revalidatePath('/attendances');
  revalidatePath(`/patients/${parsed.data.patient_id}`);
  return {
    success: 'Atención registrada correctamente',
    attendanceId: attendance.id,
  };
}

export async function updateAttendanceAction(
  _prevState: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const profile = await requireProfile();

  if (!canWriteOperations(profile.role)) {
    return { error: 'No autorizado' };
  }

  const attendanceId = formData.get('attendance_id');
  if (typeof attendanceId !== 'string') {
    return { error: 'Atención no válida' };
  }

  const parsed = attendanceBaseSchema.safeParse({
    patient_id: formData.get('patient_id'),
    service_id: formData.get('service_id'),
    total_cop: formData.get('total_cop'),
    clinical_notes: formData.get('clinical_notes') || undefined,
    attended_at: formData.get('attended_at'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from('attendances')
    .select('*')
    .eq('id', attendanceId)
    .single();

  if (fetchError || !existing) {
    return { error: 'Atención no encontrada' };
  }

  if (parsed.data.total_cop < existing.paid_cop) {
    return {
      error: 'El total no puede ser menor a lo ya pagado',
    };
  }

  const balanceCop = parsed.data.total_cop - existing.paid_cop;
  const payload = {
    patient_id: parsed.data.patient_id,
    service_id: parsed.data.service_id,
    total_cop: parsed.data.total_cop,
    balance_cop: balanceCop,
    clinical_notes: emptyToNull(parsed.data.clinical_notes),
    attended_at: parsed.data.attended_at,
  };

  const { error } = await supabase
    .from('attendances')
    .update(payload)
    .eq('id', attendanceId);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog({
    action: 'update',
    tableName: 'attendances',
    recordId: attendanceId,
    oldData: existing,
    newData: payload,
  });

  revalidatePath('/attendances');
  revalidatePath(`/attendances/${attendanceId}`);
  revalidatePath(`/patients/${parsed.data.patient_id}`);
  return { success: 'Atención actualizada', attendanceId };
}

export async function updateAttendanceNotesAction(
  _prevState: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const profile = await requireProfile();

  if (!canWriteClinical(profile.role)) {
    return { error: 'No autorizado' };
  }

  const attendanceId = formData.get('attendance_id');
  const clinicalNotes = formData.get('clinical_notes');

  if (typeof attendanceId !== 'string') {
    return { error: 'Atención no válida' };
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from('attendances')
    .select('id, patient_id, clinical_notes')
    .eq('id', attendanceId)
    .single();

  if (fetchError || !existing) {
    return { error: 'Atención no encontrada' };
  }

  const notes =
    typeof clinicalNotes === 'string' ? emptyToNull(clinicalNotes) : null;

  const { error } = await supabase
    .from('attendances')
    .update({ clinical_notes: notes })
    .eq('id', attendanceId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/attendances/${attendanceId}`);
  revalidatePath(`/patients/${existing.patient_id}`);
  return { success: 'Notas clínicas guardadas', attendanceId };
}

export async function addPaymentAction(
  _prevState: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const profile = await requireProfile();

  if (!canWriteOperations(profile.role)) {
    return { error: 'No autorizado' };
  }

  const schema = z.object({
    attendance_id: z.string().uuid(),
    payment_method: paymentMethodSchema,
    amount_cop: z.coerce
      .number()
      .int()
      .positive('El monto debe ser mayor a cero'),
  });

  const parsed = schema.safeParse({
    attendance_id: formData.get('attendance_id'),
    payment_method: formData.get('payment_method'),
    amount_cop: formData.get('amount_cop'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  const supabase = await createClient();
  const { data: attendance, error: fetchError } = await supabase
    .from('attendances')
    .select('id, patient_id, total_cop, paid_cop, balance_cop')
    .eq('id', parsed.data.attendance_id)
    .single();

  if (fetchError || !attendance) {
    return { error: 'Atención no encontrada' };
  }

  if (parsed.data.amount_cop > attendance.balance_cop) {
    return { error: 'El pago supera el saldo pendiente' };
  }

  const { error: paymentError } = await supabase.from('payments').insert({
    attendance_id: parsed.data.attendance_id,
    payment_method: parsed.data.payment_method,
    amount_cop: parsed.data.amount_cop,
    recorded_by: profile.id,
  });

  if (paymentError) {
    return { error: paymentError.message };
  }

  const sync = await syncAttendanceBalances(
    parsed.data.attendance_id,
    attendance.total_cop,
  );

  if (sync.error) {
    return { error: sync.error };
  }

  revalidatePath('/attendances');
  revalidatePath(`/attendances/${parsed.data.attendance_id}`);
  revalidatePath(`/patients/${attendance.patient_id}`);
  return {
    success: 'Pago registrado',
    attendanceId: parsed.data.attendance_id,
  };
}

export async function deleteAttendanceAction(
  attendanceId: string,
): Promise<AttendanceActionState> {
  const profile = await requireProfile();

  if (profile.role !== 'admin') {
    return { error: 'No autorizado' };
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from('attendances')
    .select('*')
    .eq('id', attendanceId)
    .single();

  if (fetchError || !existing) {
    return { error: 'Atención no encontrada' };
  }

  const { error } = await supabase
    .from('attendances')
    .delete()
    .eq('id', attendanceId);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog({
    action: 'delete',
    tableName: 'attendances',
    recordId: attendanceId,
    oldData: existing,
  });

  revalidatePath('/attendances');
  revalidatePath(`/patients/${existing.patient_id}`);
  return { success: 'Atención eliminada' };
}

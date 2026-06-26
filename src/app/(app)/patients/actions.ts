'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { writeAuditLog } from '@/lib/audit';
import { requireProfile } from '@/lib/auth';
import { canWriteOperations } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';

const patientSchema = z.object({
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

export type PatientActionState = {
  error?: string;
  success?: string;
  patientId?: string;
};

function mapPatientError(message: string): string {
  if (message.includes('patients_phone_unique_idx')) {
    return 'Ya existe un paciente con ese teléfono';
  }
  if (message.includes('patients_document_id_unique_idx')) {
    return 'Ya existe un paciente con ese documento';
  }
  return message;
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createPatientAction(
  _prevState: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const profile = await requireProfile();

  if (!canWriteOperations(profile.role)) {
    return { error: 'No autorizado' };
  }

  const parsed = patientSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone') || undefined,
    document_id: formData.get('document_id') || undefined,
    email: formData.get('email') || undefined,
    notes: formData.get('notes') || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  const supabase = await createClient();
  const payload = {
    full_name: parsed.data.full_name.trim(),
    phone: emptyToNull(parsed.data.phone),
    document_id: emptyToNull(parsed.data.document_id),
    email: emptyToNull(parsed.data.email),
    notes: emptyToNull(parsed.data.notes),
  };

  const { data, error } = await supabase
    .from('patients')
    .insert(payload)
    .select('id')
    .single();

  if (error || !data) {
    return { error: mapPatientError(error?.message ?? 'No se pudo crear el paciente') };
  }

  await writeAuditLog({
    action: 'create',
    tableName: 'patients',
    recordId: data.id,
    newData: payload,
  });

  revalidatePath('/patients');
  return {
    success: 'Paciente creado correctamente',
    patientId: data.id,
  };
}

export async function updatePatientAction(
  _prevState: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const profile = await requireProfile();

  if (!canWriteOperations(profile.role)) {
    return { error: 'No autorizado' };
  }

  const patientId = formData.get('patient_id');
  if (typeof patientId !== 'string' || !patientId) {
    return { error: 'Paciente no válido' };
  }

  const parsed = patientSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone') || undefined,
    document_id: formData.get('document_id') || undefined,
    email: formData.get('email') || undefined,
    notes: formData.get('notes') || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (fetchError || !existing) {
    return { error: 'Paciente no encontrado' };
  }

  const payload = {
    full_name: parsed.data.full_name.trim(),
    phone: emptyToNull(parsed.data.phone),
    document_id: emptyToNull(parsed.data.document_id),
    email: emptyToNull(parsed.data.email),
    notes: emptyToNull(parsed.data.notes),
  };

  const { error } = await supabase
    .from('patients')
    .update(payload)
    .eq('id', patientId);

  if (error) {
    return { error: mapPatientError(error.message) };
  }

  await writeAuditLog({
    action: 'update',
    tableName: 'patients',
    recordId: patientId,
    oldData: existing,
    newData: payload,
  });

  revalidatePath('/patients');
  revalidatePath(`/patients/${patientId}`);
  return { success: 'Paciente actualizado correctamente', patientId };
}

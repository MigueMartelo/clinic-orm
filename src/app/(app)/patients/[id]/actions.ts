'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireProfile } from '@/lib/auth';
import { canWriteClinical } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';

const medicalProfileSchema = z.object({
  patient_id: z.string().uuid(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  contraindications: z.string().optional(),
  skin_type: z.string().optional(),
  consent_notes: z.string().optional(),
});

const clinicalNoteSchema = z.object({
  patient_id: z.string().uuid(),
  title: z.string().optional(),
  content: z.string().min(1, 'La nota no puede estar vacía'),
});

export type PatientDetailActionState = {
  error?: string;
  success?: string;
};

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function upsertMedicalProfileAction(
  _prevState: PatientDetailActionState,
  formData: FormData,
): Promise<PatientDetailActionState> {
  const profile = await requireProfile();

  if (!canWriteClinical(profile.role)) {
    return { error: 'No autorizado' };
  }

  const parsed = medicalProfileSchema.safeParse({
    patient_id: formData.get('patient_id'),
    allergies: formData.get('allergies') || undefined,
    medications: formData.get('medications') || undefined,
    contraindications: formData.get('contraindications') || undefined,
    skin_type: formData.get('skin_type') || undefined,
    consent_notes: formData.get('consent_notes') || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  const supabase = await createClient();
  const payload = {
    patient_id: parsed.data.patient_id,
    allergies: emptyToNull(parsed.data.allergies),
    medications: emptyToNull(parsed.data.medications),
    contraindications: emptyToNull(parsed.data.contraindications),
    skin_type: emptyToNull(parsed.data.skin_type),
    consent_notes: emptyToNull(parsed.data.consent_notes),
  };

  const { error } = await supabase
    .from('patient_medical_profiles')
    .upsert(payload, { onConflict: 'patient_id' });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/patients/${parsed.data.patient_id}`);
  return { success: 'Perfil médico guardado' };
}

export async function addClinicalNoteAction(
  _prevState: PatientDetailActionState,
  formData: FormData,
): Promise<PatientDetailActionState> {
  const profile = await requireProfile();

  if (!canWriteClinical(profile.role)) {
    return { error: 'No autorizado' };
  }

  const parsed = clinicalNoteSchema.safeParse({
    patient_id: formData.get('patient_id'),
    title: formData.get('title') || undefined,
    content: formData.get('content'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('clinical_history_entries').insert({
    patient_id: parsed.data.patient_id,
    entry_type: 'clinical_note',
    title: emptyToNull(parsed.data.title),
    content: parsed.data.content.trim(),
    recorded_by: profile.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/patients/${parsed.data.patient_id}`);
  return { success: 'Nota clínica agregada' };
}

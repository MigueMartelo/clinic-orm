'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

export type UpdateProfileState = {
  error?: string;
  success?: string;
};

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const profile = await requireProfile();

  const parsed = updateProfileSchema.safeParse({
    full_name: formData.get('full_name'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.full_name })
    .eq('id', profile.id);

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.full_name },
  });

  if (authError) {
    return { error: authError.message };
  }

  revalidatePath('/perfil');
  revalidatePath('/', 'layout');

  return { success: 'Perfil actualizado correctamente' };
}

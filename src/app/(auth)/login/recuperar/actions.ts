'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const requestResetSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
});

export type RequestResetState = {
  error?: string;
  success?: string;
};

async function getAppOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';

  if (!host) {
    return 'http://localhost:3000';
  }

  return `${protocol}://${host}`;
}

export async function requestPasswordResetAction(
  _prevState: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const parsed = requestResetSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  const supabase = await createClient();
  const origin = await getAppOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return { error: 'No se pudo enviar el enlace. Intenta de nuevo.' };
  }

  return {
    success:
      'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
  };
}

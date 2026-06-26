function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

/** Server-only: dynamic lookup is fine (never bundled for the browser). */
function readServerEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = trimEnv(process.env[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function hasSupabaseClientEnv(): boolean {
  return Boolean(
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (trimEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
        trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)),
  );
}

export function getSupabaseUrl(): string {
  const url = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  return url;
}

export function getSupabasePublishableKey(): string {
  const key =
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  }

  return key;
}

export function getSupabaseSecretKey(): string | undefined {
  return readServerEnv("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");
}

export function requireSupabaseSecretKey(): string {
  const key = getSupabaseSecretKey();

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY)",
    );
  }

  return key;
}

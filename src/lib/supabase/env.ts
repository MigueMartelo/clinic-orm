function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function hasSupabaseClientEnv(): boolean {
  return Boolean(
    readEnv("NEXT_PUBLIC_SUPABASE_URL") &&
      readEnv(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ),
  );
}

export function getSupabaseUrl(): string {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  return url;
}

export function getSupabasePublishableKey(): string {
  const key = readEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );

  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  }

  return key;
}

export function getSupabaseSecretKey(): string | undefined {
  return readEnv("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");
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

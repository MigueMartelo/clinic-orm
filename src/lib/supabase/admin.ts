import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import {
  getSupabaseUrl,
  requireSupabaseSecretKey,
} from "@/lib/supabase/env";

export function createAdminClient() {
  return createClient<Database>(getSupabaseUrl(), requireSupabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

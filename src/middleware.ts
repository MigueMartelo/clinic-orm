import { type NextRequest, NextResponse } from "next/server";

import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (!hasSupabaseClientEnv()) {
    return NextResponse.next({ request });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

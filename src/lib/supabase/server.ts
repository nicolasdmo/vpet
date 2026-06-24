// Server Supabase client for Next.js server components / route handlers (R2).
// Cookie-based session; never exposes the service role to the browser.
// The service role (server-authoritative writes, R22) is used only inside the
// Supabase Edge Function, not here.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component without a mutable cookie store — safe to ignore.
          }
        },
      },
    },
  );
}

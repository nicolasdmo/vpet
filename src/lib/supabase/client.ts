// Browser Supabase client (R1 Google auth, R2 persistence, R30 realtime player list).
// Reads public env vars; safe for the browser. Auth uses Supabase's Google provider.
// NOTE: requires a real Supabase project + env vars to function (not provisioned here).

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Kick off Google OAuth (R1).
export async function signInWithGoogle() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

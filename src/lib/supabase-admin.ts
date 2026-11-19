import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (cached) return cached;

  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables'
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cached;
}

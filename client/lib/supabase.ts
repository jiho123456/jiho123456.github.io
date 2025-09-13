import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey, {
  auth: {
    // persist session in localStorage but avoid automatic background token refresh
    persistSession: true,
    autoRefreshToken: false,
  },
}) : null;

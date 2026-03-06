import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function getPublicSupabase() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Supabase public environment variables are missing.");
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}

export function getAdminSupabase() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

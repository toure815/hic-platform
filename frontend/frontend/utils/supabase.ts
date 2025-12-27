import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Utility function to safely resolve env vars
function getEnvVar(keys: string[]): string | undefined {
  for (const key of keys) {
    // Vite (import.meta.env)
    if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
      return (import.meta as any).env[key];
    }
    // Node / Encore process.env
    if (typeof process !== "undefined" && (process as any).env?.[key]) {
      return (process as any).env[key];
    }
    // Browser global injected by Encore/Leap (optional)
    if (typeof window !== "undefined" && (window as any).__ENV?.[key]) {
      return (window as any).__ENV[key];
    }
  }
  return undefined;
}

// ---- RESOLVE URL ----
const SUPABASE_URL =
  getEnvVar([
    "VITE_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
  ]) || "";

// ---- RESOLVE ANON KEY ----
const SUPABASE_ANON_KEY =
  getEnvVar([
    "VITE_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
  ]) || "";

// Determine environment
const NODE_ENV =
  getEnvVar(["VITE_NODE_ENV", "NODE_ENV", "ENCORE_ENV"]) || "unknown";

// Debug log (will only show once at build/runtime)
console.log("⚡ Supabase Env Debug:", {
  NODE_ENV,
  SUPABASE_URL: SUPABASE_URL ? "[ok]" : "(missing)",
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? "[ok]" : "(missing)",
});

// Export checker
export const isSupabaseReady = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Lazy client init
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("❌ Missing Supabase environment variables!");
    }
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// Export proxy client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});




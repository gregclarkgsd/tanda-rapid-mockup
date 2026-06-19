export type SupabaseEnv = Partial<Record<'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY', string | undefined>>

export type SupabaseConfig = {
  configured: boolean
  url?: string
  anonKey?: string
  reason?: string
}

export type SupabaseQueryResult<Row> = Promise<{ data: Row[] | null; error: { message?: string } | null }>

export type SupabaseClientLike<Row = unknown> = {
  from: (table: string) => {
    select: (columns: string) => {
      order: (column: string, options?: { ascending?: boolean }) => SupabaseQueryResult<Row>
    }
  }
}

export function getSupabaseConfig(env: SupabaseEnv = readRuntimeEnv()): SupabaseConfig {
  const url = env.VITE_SUPABASE_URL?.trim()
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    return {
      configured: false,
      reason: 'Supabase is disabled until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.',
    }
  }

  return { configured: true, url, anonKey }
}

export function createSupabaseClient<TClient>(
  config: SupabaseConfig = getSupabaseConfig(),
  factory?: (config: Required<Pick<SupabaseConfig, 'url' | 'anonKey'>>) => TClient,
): TClient | null {
  if (!config.configured || !config.url || !config.anonKey) return null
  if (!factory) return null
  return factory({ url: config.url, anonKey: config.anonKey })
}

function readRuntimeEnv(): SupabaseEnv {
  const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env as SupabaseEnv | undefined : undefined
  if (viteEnv?.VITE_SUPABASE_URL || viteEnv?.VITE_SUPABASE_ANON_KEY) return viteEnv

  if (typeof process !== 'undefined') {
    return {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    }
  }

  return {}
}

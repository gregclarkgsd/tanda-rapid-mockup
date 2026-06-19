import assert from 'node:assert/strict'
import { createSupabaseClient, getSupabaseConfig } from './supabase'

const missing = getSupabaseConfig({})
assert.equal(missing.configured, false)
assert.equal(missing.url, undefined)
assert.equal(missing.anonKey, undefined)
assert.match(missing.reason ?? '', /VITE_SUPABASE_URL/)

const configured = getSupabaseConfig({
  VITE_SUPABASE_URL: 'https://siteclock-example.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'redacted-anon-key',
})
assert.equal(configured.configured, true)
assert.equal(configured.url, 'https://siteclock-example.supabase.co')
assert.equal(configured.anonKey, 'redacted-anon-key')

let factoryCalls = 0
const noClient = createSupabaseClient(missing, () => {
  factoryCalls += 1
  return { from: () => ({}) }
})
assert.equal(noClient, null)
assert.equal(factoryCalls, 0)

const client = createSupabaseClient(configured, (config) => {
  factoryCalls += 1
  return { from: (table: string) => ({ table, url: config.url }) }
})
assert.equal(factoryCalls, 1)
assert.deepEqual(client?.from('staff_profiles'), { table: 'staff_profiles', url: 'https://siteclock-example.supabase.co' })

console.log('supabase config tests passed')

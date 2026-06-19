import assert from 'node:assert/strict'
import type { StaffProfile } from './staff'
import { createStaffRepository, mapStaffProfileRow } from './staffRepository'

const fallback: StaffProfile[] = [
  {
    id: 'demo-aaron',
    name: 'Aaron Patel',
    role: 'Supervisor',
    contact: {
      mobile: '07700 900101',
      email: 'aaron.patel@gsd.example',
      emergencyContactName: 'Priya Patel',
      emergencyContactPhone: '07700 900199',
    },
    employment: { payrollId: 'GSD-001', startDate: '2022-04-01', status: 'active' },
    skills: ['SSSTS'],
    training: [],
    notes: [],
  },
]

const mapped = mapStaffProfileRow({
  id: 'staff-1',
  full_name: 'Mia O’Connor',
  role: 'Painter',
  employment_status: 'active',
  payroll_id: 'GSD-014',
  start_date: '2024-02-12',
  staff_contacts: [{
    mobile: '07700 900102',
    email: null,
    emergency_contact_name: 'Sean O’Connor',
    emergency_contact_phone: '07700 900198',
  }],
  staff_skills: [{ tag: ' Painter ' }, { tag: 'painter' }, { tag: 'MEWP' }],
  training_certificates: [{
    id: 'cert-1',
    certificate_name: 'MEWP/IPAF',
    certificate_no: 'IPAF-1299',
    expires_on: '2026-06-23',
    status: 'verified',
  }],
  staff_notes: [{
    id: 'note-1',
    created_at: '2026-05-20T09:15:00Z',
    author_name: 'Aaron Patel',
    body: 'Available for weekend snagging.',
    visibility: 'manager',
  }],
})
assert.equal(mapped.name, 'Mia O’Connor')
assert.equal(mapped.contact.email, '—')
assert.deepEqual(mapped.skills, ['MEWP', 'Painter'])
assert.deepEqual(mapped.training[0], {
  id: 'cert-1',
  name: 'MEWP/IPAF',
  certificateNo: 'IPAF-1299',
  expiresOn: '2026-06-23',
  status: 'verified',
})
assert.equal(mapped.notes[0].author, 'Aaron Patel')

const fallbackRepo = createStaffRepository({ fallback })
const fallbackResult = await fallbackRepo.listStaffProfiles()
assert.equal(fallbackResult.source, 'fallback')
assert.deepEqual(fallbackResult.data, fallback)

const errorRepo = createStaffRepository({
  fallback,
  supabase: {
    from: () => ({
      select: () => ({
        order: async () => ({ data: null, error: { message: 'network unavailable' } }),
      }),
    }),
  },
})
const errorResult = await errorRepo.listStaffProfiles()
assert.equal(errorResult.source, 'fallback')
assert.equal(errorResult.error, 'network unavailable')
assert.deepEqual(errorResult.data, fallback)

const supabaseRepo = createStaffRepository({
  fallback,
  supabase: {
    from: (table: string) => ({
      select: (columns: string) => ({
        order: async (column: string) => {
          assert.equal(table, 'staff_profiles')
          assert.match(columns, /staff_contacts/)
          assert.equal(column, 'full_name')
          return { data: [{ id: 'staff-2', full_name: 'Lewis Grant', role: 'Dryliner', employment_status: 'active' }], error: null }
        },
      }),
    }),
  },
})
const supabaseResult = await supabaseRepo.listStaffProfiles()
assert.equal(supabaseResult.source, 'supabase')
assert.equal(supabaseResult.data[0].name, 'Lewis Grant')
assert.equal(supabaseResult.data[0].contact.mobile, '—')

console.log('staff repository tests passed')

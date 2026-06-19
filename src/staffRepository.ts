import { normaliseSkillTags, type StaffContact, type StaffEmployment, type StaffNote, type StaffProfile, type TrainingCertificate } from './staff'
import type { SupabaseClientLike } from './supabase'

export type StaffRepositoryResult = {
  source: 'supabase' | 'fallback'
  data: StaffProfile[]
  error?: string
}

export type StaffRepository = {
  listStaffProfiles: () => Promise<StaffRepositoryResult>
}

type StaffContactRow = {
  mobile?: string | null
  email?: string | null
  address?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
}

type StaffSkillRow = { tag?: string | null }

type TrainingCertificateRow = {
  id?: string | null
  certificate_name?: string | null
  certificate_no?: string | null
  expires_on?: string | null
  status?: string | null
}

type StaffNoteRow = {
  id?: string | null
  created_at?: string | null
  author_name?: string | null
  body?: string | null
  visibility?: string | null
}

export type StaffProfileRow = {
  id?: string | null
  full_name?: string | null
  role?: string | null
  employment_status?: string | null
  payroll_id?: string | null
  start_date?: string | null
  staff_contacts?: StaffContactRow[] | StaffContactRow | null
  staff_skills?: StaffSkillRow[] | null
  training_certificates?: TrainingCertificateRow[] | null
  staff_notes?: StaffNoteRow[] | null
}

const STAFF_PROFILE_SELECT = `
  id,
  full_name,
  role,
  employment_status,
  payroll_id,
  start_date,
  staff_contacts(mobile,email,address,emergency_contact_name,emergency_contact_phone),
  staff_skills(tag),
  training_certificates(id,certificate_name,certificate_no,expires_on,status),
  staff_notes(id,created_at,author_name,body,visibility)
`

export function createStaffRepository({ supabase = null, fallback }: { supabase?: SupabaseClientLike<StaffProfileRow> | null; fallback: StaffProfile[] }): StaffRepository {
  return {
    async listStaffProfiles() {
      if (!supabase) return { source: 'fallback', data: fallback }

      try {
        const result = await supabase
          .from('staff_profiles')
          .select(STAFF_PROFILE_SELECT)
          .order('full_name', { ascending: true })

        if (result.error) {
          return { source: 'fallback', data: fallback, error: result.error.message ?? 'Supabase query failed' }
        }

        return { source: 'supabase', data: (result.data ?? []).map(mapStaffProfileRow) }
      } catch (error) {
        return { source: 'fallback', data: fallback, error: error instanceof Error ? error.message : 'Supabase query failed' }
      }
    },
  }
}

export function mapStaffProfileRow(row: StaffProfileRow): StaffProfile {
  const contact = first(row.staff_contacts)

  return {
    id: valueOrDash(row.id),
    name: valueOrDash(row.full_name),
    role: valueOrDash(row.role),
    contact: mapContact(contact),
    employment: mapEmployment(row),
    skills: normaliseSkillTags((row.staff_skills ?? []).map((skill) => skill.tag ?? '')),
    training: (row.training_certificates ?? []).map(mapTrainingCertificate),
    notes: (row.staff_notes ?? []).map(mapStaffNote),
  }
}

function mapContact(row?: StaffContactRow): StaffContact {
  return {
    mobile: valueOrDash(row?.mobile),
    email: valueOrDash(row?.email),
    emergencyContactName: valueOrDash(row?.emergency_contact_name),
    emergencyContactPhone: valueOrDash(row?.emergency_contact_phone),
    address: row?.address ?? undefined,
  }
}

function mapEmployment(row: StaffProfileRow): StaffEmployment {
  return {
    payrollId: valueOrDash(row.payroll_id),
    startDate: valueOrDash(row.start_date),
    status: row.employment_status === 'inactive' || row.employment_status === 'leaver' ? row.employment_status : 'active',
  }
}

function mapTrainingCertificate(row: TrainingCertificateRow): TrainingCertificate {
  return {
    id: valueOrDash(row.id),
    name: valueOrDash(row.certificate_name),
    certificateNo: row.certificate_no ?? undefined,
    expiresOn: row.expires_on ?? undefined,
    status: row.status === 'pending' || row.status === 'missing' ? row.status : 'verified',
  }
}

function mapStaffNote(row: StaffNoteRow): StaffNote {
  return {
    id: valueOrDash(row.id),
    at: valueOrDash(row.created_at),
    author: valueOrDash(row.author_name),
    body: valueOrDash(row.body),
    visibility: row.visibility === 'payroll' || row.visibility === 'agent' ? row.visibility : 'manager',
  }
}

function first<T>(value: T[] | T | null | undefined): T | undefined {
  if (Array.isArray(value)) return value[0]
  return value ?? undefined
}

function valueOrDash(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : '—'
}

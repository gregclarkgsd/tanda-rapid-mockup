export type TrainingReminderLevel = 'none' | 'watch' | 'urgent' | 'blocked'
export type TrainingState = 'valid' | 'expiring_soon' | 'expired' | 'missing'

export type StaffContact = {
  mobile: string
  email: string
  emergencyContactName: string
  emergencyContactPhone: string
  address?: string
}

export type StaffEmployment = {
  payrollId: string
  startDate: string
  status: 'active' | 'inactive' | 'leaver'
}

export type TrainingCertificate = {
  id: string
  name: string
  certificateNo?: string
  expiresOn?: string
  status: 'verified' | 'pending' | 'missing'
}

export type StaffNote = {
  id: string
  at: string
  author: string
  body: string
  visibility: 'manager' | 'payroll' | 'agent'
}

export type StaffProfile = {
  id: string
  name: string
  role: string
  contact: StaffContact
  employment: StaffEmployment
  skills: string[]
  training: TrainingCertificate[]
  notes: StaffNote[]
}

export type TrainingExpirySummary = {
  state: TrainingState
  daysRemaining: number | null
  reminderLevel: TrainingReminderLevel
}

export type AgentStaffTask = {
  id: string
  type: 'training_expired' | 'training_expiring' | 'training_missing'
  staffId: string
  staffName: string
  certificateId: string
  certificateName: string
  priority: 'blocker' | 'high' | 'medium'
  dueOn?: string
  instruction: string
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

function daysBetween(fromDate: string, toDate: string) {
  return Math.round((parseDateOnly(toDate) - parseDateOnly(fromDate)) / MS_PER_DAY)
}

export function normaliseSkillTags(tags: string[]) {
  const byKey = new Map<string, string>()
  tags.map((tag) => tag.trim().replace(/\s+/g, ' ')).filter(Boolean).forEach((tag) => {
    const key = tag.toLocaleLowerCase()
    if (!byKey.has(key)) byKey.set(key, tag)
  })
  return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b))
}

export function trainingExpiryStatus(certificate: TrainingCertificate, today: string, warningDays = 30): TrainingExpirySummary {
  if (certificate.status === 'missing' || !certificate.expiresOn) {
    return { state: 'missing', daysRemaining: null, reminderLevel: 'blocked' }
  }

  const daysRemaining = daysBetween(today, certificate.expiresOn)
  if (daysRemaining < 0) return { state: 'expired', daysRemaining, reminderLevel: 'blocked' }
  if (daysRemaining <= 14) return { state: 'expiring_soon', daysRemaining, reminderLevel: 'urgent' }
  if (daysRemaining <= warningDays) return { state: 'expiring_soon', daysRemaining, reminderLevel: 'watch' }
  return { state: 'valid', daysRemaining, reminderLevel: 'none' }
}

export function buildAgentTasks(staffProfiles: StaffProfile[], today: string): AgentStaffTask[] {
  const tasks: AgentStaffTask[] = []

  staffProfiles.forEach((profile) => {
    profile.training.forEach((certificate) => {
      const summary = trainingExpiryStatus(certificate, today)
      const base = {
        staffId: profile.id,
        staffName: profile.name,
        certificateId: certificate.id,
        certificateName: certificate.name,
        dueOn: certificate.expiresOn,
      }

      if (summary.state === 'missing') {
        tasks.push({
          ...base,
          id: `${profile.id}-${certificate.id}-missing`,
          type: 'training_missing',
          priority: 'blocker',
          instruction: `${profile.name} is missing ${certificate.name}. Request upload, block from projects requiring this certificate, and notify manager.`,
        })
      }

      if (summary.state === 'expired') {
        tasks.push({
          ...base,
          id: `${profile.id}-${certificate.id}-expired`,
          type: 'training_expired',
          priority: 'blocker',
          instruction: `${profile.name}'s ${certificate.name} expired ${Math.abs(summary.daysRemaining ?? 0)} days ago. Block relevant rota assignment, notify manager, and chase renewed certificate.`,
        })
      }

      if (summary.state === 'expiring_soon') {
        tasks.push({
          ...base,
          id: `${profile.id}-${certificate.id}-expiring`,
          type: 'training_expiring',
          priority: summary.reminderLevel === 'urgent' ? 'high' : 'medium',
          instruction: `${profile.name}'s ${certificate.name} expires in ${summary.daysRemaining} days. Schedule reminder and request renewed certificate before expiry.`,
        })
      }
    })
  })

  const rank = { blocker: 0, high: 1, medium: 2 }
  return tasks.sort((a, b) => rank[a.priority] - rank[b.priority] || a.staffName.localeCompare(b.staffName))
}

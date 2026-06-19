import assert from 'node:assert/strict'
import { buildAgentTasks, normaliseSkillTags, trainingExpiryStatus, type StaffProfile } from './staff'

const today = '2026-06-19'

const profile: StaffProfile = {
  id: 'aaron',
  name: 'Aaron Patel',
  role: 'Supervisor',
  contact: {
    mobile: '07700 900101',
    email: 'aaron@example.com',
    emergencyContactName: 'Priya Patel',
    emergencyContactPhone: '07700 900199',
  },
  employment: {
    payrollId: 'GSD-001',
    startDate: '2022-04-01',
    status: 'active',
  },
  skills: ['SSSTS', ' Painting ', 'painting', 'First Aid'],
  training: [
    { id: 'cert-1', name: 'CSCS Card', certificateNo: 'CSCS-7788', expiresOn: '2026-06-29', status: 'verified' },
    { id: 'cert-2', name: 'Asbestos Awareness', certificateNo: 'AA-9912', expiresOn: '2026-06-10', status: 'verified' },
    { id: 'cert-3', name: 'First Aid', certificateNo: 'FA-2041', expiresOn: '2026-09-30', status: 'verified' },
  ],
  notes: [
    { id: 'note-1', at: '2026-06-01T10:00:00Z', author: 'Nina Brooks', body: 'Prefers Canary Wharf starts.', visibility: 'manager' },
  ],
}

assert.deepEqual(normaliseSkillTags(profile.skills), ['First Aid', 'Painting', 'SSSTS'])

assert.deepEqual(trainingExpiryStatus(profile.training[0], today), {
  state: 'expiring_soon',
  daysRemaining: 10,
  reminderLevel: 'urgent',
})

assert.deepEqual(trainingExpiryStatus(profile.training[1], today), {
  state: 'expired',
  daysRemaining: -9,
  reminderLevel: 'blocked',
})

assert.deepEqual(trainingExpiryStatus(profile.training[2], today), {
  state: 'valid',
  daysRemaining: 103,
  reminderLevel: 'none',
})

const tasks = buildAgentTasks([profile], today)
assert.equal(tasks.length, 2)
assert.deepEqual(tasks.map((task) => task.type), ['training_expired', 'training_expiring'])
assert.equal(tasks[0].staffId, 'aaron')
assert.equal(tasks[0].priority, 'blocker')
assert.match(tasks[0].instruction, /Asbestos Awareness expired 9 days ago/)
assert.equal(tasks[1].priority, 'high')
assert.match(tasks[1].instruction, /CSCS Card expires in 10 days/)

console.log('staff tests passed')

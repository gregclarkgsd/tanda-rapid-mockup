import assert from 'node:assert/strict'
import { classifySample, summariseShift, type Geofence, type LocationSample } from './geo'

const fence: Geofence = { id: 'cw', name: 'Canary Wharf', lat: 51.5055, lng: -0.0235, radiusM: 125 }

const inside: LocationSample = {
  workerId: 'w1',
  projectId: 'cw',
  lat: 51.5057,
  lng: -0.0231,
  accuracyM: 12,
  capturedAt: '2026-06-19T08:04:00Z',
  permission: 'granted',
  battery: 0.74
}

const outside: LocationSample = {
  ...inside,
  lat: 51.5084,
  lng: -0.0202,
  accuracyM: 18,
  capturedAt: '2026-06-19T10:18:00Z'
}

assert.equal(classifySample(inside, fence).state, 'inside')
assert.equal(classifySample(outside, fence).state, 'outside')
assert.equal(classifySample({ ...inside, accuracyM: 180 }, fence).state, 'low_accuracy')
assert.equal(classifySample({ ...inside, permission: 'denied' }, fence).state, 'gps_disabled')

const summary = summariseShift([inside, outside, { ...inside, capturedAt: '2026-06-19T10:31:00Z' }], fence)
assert.equal(summary.currentState, 'inside')
assert.equal(summary.events.length, 2)
assert.equal(summary.events[0].eventType, 'exited')
assert.equal(summary.events[1].eventType, 'entered')
assert.equal(summary.alerts[0].severity, 'high')

console.log('geo tests passed')

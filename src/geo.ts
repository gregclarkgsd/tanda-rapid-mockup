export type Geofence = {
  id: string
  name: string
  lat: number
  lng: number
  radiusM: number
}

export type LocationPermission = 'granted' | 'denied' | 'prompt' | 'unavailable'

export type LocationSample = {
  workerId: string
  projectId: string
  lat: number
  lng: number
  accuracyM: number
  capturedAt: string
  permission: LocationPermission
  battery?: number
}

export type PresenceState = 'inside' | 'outside' | 'low_accuracy' | 'gps_disabled'

export type ClassifiedSample = LocationSample & {
  distanceFromCentreM: number
  distanceFromFenceM: number
  state: PresenceState
  confidence: 'high' | 'medium' | 'low'
}

export type GeofenceEvent = {
  eventType: 'entered' | 'exited'
  at: string
  distanceFromFenceM: number
  accuracyM: number
  severity: 'info' | 'high'
}

export type ShiftSummary = {
  currentState: PresenceState
  samples: ClassifiedSample[]
  events: GeofenceEvent[]
  alerts: GeofenceEvent[]
}

const EARTH_RADIUS_M = 6_371_000
const LOW_ACCURACY_THRESHOLD_M = 100

function toRadians(value: number) {
  return value * Math.PI / 180
}

export function distanceMeters(a: Pick<Geofence, 'lat' | 'lng'>, b: Pick<Geofence, 'lat' | 'lng'>) {
  const deltaLat = toRadians(b.lat - a.lat)
  const deltaLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function classifySample(sample: LocationSample, fence: Geofence): ClassifiedSample {
  const distanceFromCentreM = Math.round(distanceMeters(fence, sample))
  const distanceFromFenceM = Math.round(distanceFromCentreM - fence.radiusM)

  if (sample.permission !== 'granted') {
    return { ...sample, distanceFromCentreM, distanceFromFenceM, state: 'gps_disabled', confidence: 'low' }
  }

  if (sample.accuracyM > LOW_ACCURACY_THRESHOLD_M) {
    return { ...sample, distanceFromCentreM, distanceFromFenceM, state: 'low_accuracy', confidence: 'low' }
  }

  const state: PresenceState = distanceFromCentreM <= fence.radiusM + sample.accuracyM ? 'inside' : 'outside'
  const confidence = sample.accuracyM <= 25 ? 'high' : sample.accuracyM <= 60 ? 'medium' : 'low'
  return { ...sample, distanceFromCentreM, distanceFromFenceM, state, confidence }
}

export function summariseShift(samples: LocationSample[], fence: Geofence): ShiftSummary {
  const classified = [...samples]
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
    .map((sample) => classifySample(sample, fence))

  const events: GeofenceEvent[] = []
  let previousTrackable: ClassifiedSample | undefined

  for (const sample of classified) {
    if (sample.state !== 'inside' && sample.state !== 'outside') continue
    if (previousTrackable && previousTrackable.state !== sample.state) {
      const exited = previousTrackable.state === 'inside' && sample.state === 'outside'
      events.push({
        eventType: exited ? 'exited' : 'entered',
        at: sample.capturedAt,
        distanceFromFenceM: sample.distanceFromFenceM,
        accuracyM: sample.accuracyM,
        severity: exited ? 'high' : 'info'
      })
    }
    previousTrackable = sample
  }

  const currentState = classified[classified.length - 1]?.state ?? 'gps_disabled'
  return {
    currentState,
    samples: classified,
    events,
    alerts: events.filter((event) => event.severity === 'high')
  }
}

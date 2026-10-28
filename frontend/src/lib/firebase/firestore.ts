import { collection, doc, type CollectionReference, type DocumentData } from 'firebase/firestore'
import { getClientDb } from './client'
import type { PitStop, QueueReport, UserProfile } from '@/types/firestore'

/**
 * Creates a typed Firestore collection reference.
 * Use this factory to add new collections — see docs/FIRESTORE-SCHEMA.md
 */
function typedCollection<T extends DocumentData>(path: string): CollectionReference<T> {
  return collection(getClientDb(), path) as CollectionReference<T>
}

// ── Collections ──────────────────────────────────────────────────────────────
// Add one export per Firestore collection. Keep in sync with:
//   - src/types/firestore.ts
//   - firebase/firestore.rules
//   - docs/FIRESTORE-SCHEMA.md

export function getUsersCollection() {
  return typedCollection<UserProfile>('users')
}

export function userDoc(uid: string) {
  return doc(getUsersCollection(), uid)
}


// Pit Stops
export function getPitStopsCollection() {
  return typedCollection<PitStop>('pitStops')
}

export function pitStopDoc(id: string) {
  return doc(getPitStopsCollection(), id)
}

// Queue Reports 

export function getQueueReportsCollection() {
  return typedCollection<QueueReport>('queueReports')
}

export function queueReportDoc(id: string) {
  return doc(getQueueReportsCollection(), id)
}

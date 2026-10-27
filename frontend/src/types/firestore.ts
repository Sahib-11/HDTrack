import type { Timestamp } from 'firebase/firestore'

/**
 * Firestore collection type definitions.
 *
 * Keep in sync with:
 *   - src/lib/firebase/firestore.ts  (typed collection exports)
 *   - firebase/firestore.rules       (security rules)
 *   - docs/FIRESTORE-SCHEMA.md       (schema documentation)
 *
 * When adding a new collection, use the /firebase-collection skill.
 */

export interface UserProfile {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  role: 'user'
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 1
}

export type CreateUserProfileInput = Omit<UserProfile, 'createdAt' | 'updatedAt'>

// A Pit Stop location where fans can report queue levels
export interface PitStop {
  id: string
  name: string
  location: string
  isActive: boolean
  _schemaVersion: 1
}

// Three supported levels of queue congestion
export type QueueLevel = 'short' | 'moderate' | 'long'

// A queue report submitted by an authenticated fan
export interface QueueReport {
  id: string
  pitStopId: string
  uid: string
  level: QueueLevel
  createdAt: Timestamp
  _schemaVersion: 1
}